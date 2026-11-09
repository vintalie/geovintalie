<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserType;
use App\Models\Property;
use App\Models\Product;
use App\Models\Stock;
use App\Models\ReportDemandSignal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Autenticacao e autorizacao --------------------------------------- */

    public function test_relatorios_requerem_autenticacao(): void
    {
        $this->get("{$this->base}/reports")->assertStatus(401);
        $this->get("{$this->base}/reports/heatmap")->assertStatus(401);
        $this->get("{$this->base}/reports/supply")->assertStatus(401);
        $this->get("{$this->base}/reports/demand")->assertStatus(401);
        $this->get("{$this->base}/reports/export")->assertStatus(401);
    }

    public function test_relatorios_requerem_feature_flag_ativa(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        User::factory()->create(['email' => 'cliente@teste.com', 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);
        $token = $this->login('cliente@teste.com', 'senha123');

        \App\Models\FeatureFlag::where('name', 'ff_reports')->update(['enabled' => false]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/reports/heatmap")
            ->assertStatus(403);
    }

    /** Resumo ---------------------------------------------------------- */

    public function test_resumo_relatorio_retorna_estrutura_esperada(): void
    {
        $token = $this->obterToken('user');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/reports")
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_supply',
                    'total_demand',
                    'balance',
                    'coverage_areas',
                    'categories',
                    'generated_at',
                ],
            ]);
    }

    /** Mapa de calor --------------------------------------------------- */

    public function test_heatmap_retorna_celulas_com_oferta_demanda_score_intensidade(): void
    {
        $token = $this->obterToken('user');

        $property = Property::create([
            'name' => 'Loja Centro',
            'n_property' => '10',
            'street_id' => null,
            'user_id' => $this->usuarioIdDoToken($token),
            'latitude' => -23.5505,
            'longitude' => -46.6333,
        ]);

        Product::factory()->create([
            'name' => 'Arroz Tipo 1',
            'tipo' => 'alimento',
            'price' => 5.90,
            'property_id' => $property->id,
            'user_id' => $property->user_id,
        ]);
        Stock::create([
            'product_id' => Product::where('property_id', $property->id)->first()->id,
            'property_id' => $property->id,
            'quantity' => 20,
        ]);

        ReportDemandSignal::create([
            'category' => 'alimento',
            'signal_type' => 'search',
            'weight' => 10,
            'property_id' => $property->id,
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'latitude' => -23.5505,
            'longitude' => -46.6333,
            'recorded_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/reports/heatmap");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $cell) {
            $this->assertArrayHasKey('lat', $cell);
            $this->assertArrayHasKey('lng', $cell);
            $this->assertArrayHasKey('supply', $cell);
            $this->assertArrayHasKey('demand', $cell);
            $this->assertArrayHasKey('score', $cell);
            $this->assertArrayHasKey('intensity', $cell);
            $this->assertContains($cell['intensity'], ['baixo', 'medio', 'alto', 'critico']);
        }
    }

    /** Pontos de oferta e demanda ------------------------------------- */

    public function test_supply_retorna_pontos_de_oferta_com_estoque(): void
    {
        $token = $this->obterToken('user');

        $property = Property::create([
            'name' => 'Loja Estoque',
            'n_property' => '20',
            'street_id' => null,
            'user_id' => $this->usuarioIdDoToken($token),
        ]);
        $product = Product::factory()->create([
            'name' => 'Feijao',
            'tipo' => 'alimento',
            'price' => 4.50,
            'property_id' => $property->id,
            'user_id' => $property->user_id,
        ]);
        Stock::create([
            'product_id' => $product->id,
            'property_id' => $property->id,
            'quantity' => 50,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/reports/supply?category=alimento");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals(50, (int) $data[0]['quantity']);
        $this->assertEquals('alimento', $data[0]['category']);
    }

    public function test_demand_retorna_sinais_agrupados(): void
    {
        $token = $this->obterToken('user');

        $property = Property::create([
            'name' => 'Loja Demanda',
            'n_property' => '30',
            'street_id' => null,
            'user_id' => $this->usuarioIdDoToken($token),
        ]);
        ReportDemandSignal::create([
            'category' => 'bebida',
            'signal_type' => 'search',
            'weight' => 7,
            'property_id' => $property->id,
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'latitude' => -23.55,
            'longitude' => -46.63,
            'recorded_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/reports/demand?category=bebida");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals(7, (int) $data[0]['weight']);
        $this->assertEquals('bebida', $data[0]['category']);
    }

    /** Exportacao ------------------------------------------------------ */

    public function test_export_relatorio_retorna_csv(): void
    {
        $token = $this->obterToken('user');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/reports/export")
            ->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8')
            ->assertSee('category,signal_type,weight,property_id,property_name,city,state,latitude,longitude,recorded_at');
    }

    /* Helpers -------------------------------------------------------- */

    private function obterToken(string $tipoNome): string
    {
        $tipo = UserType::firstOrCreate(['nome' => $tipoNome], ['nome' => $tipoNome]);
        $email = "{$tipoNome}@teste.com";
        User::factory()->create(['email' => $email, 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);

        $login = $this->login($email, 'senha123');
        return $login->json('token');
    }

    private function login(string $email, string $password): \Illuminate\Http\Testing\TestResponse
    {
        return $this->post('/api/login', ['email' => $email, 'password' => $password]);
    }

    private function usuarioIdDoToken(string $token): int
    {
        $parts = explode('.', $token);
        $payload = json_decode(base64_decode($parts[1] ?? '{}'), true);
        return (int) ($payload['sub'] ?? 1);
    }
}
