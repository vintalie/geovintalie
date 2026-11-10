<?php

namespace Tests\Feature;

use App\Models\ServiceCategory;
use App\Models\ServiceListing;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceSearchTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Busca de servicos com filtros (Escopo B2) ----------------------------- */

    public function test_busca_sem_filtros_retorna_apenas_anuncios_ativos(): void
    {
        $categoria = ServiceCategory::first();
        $prestador = $this->criarPrestador();

        $this->criarAnuncio($prestador->id, $categoria->id, 'Ativo A', 'Sao Paulo', 'SP', 4.50, 100.00, true);
        $this->criarAnuncio($prestador->id, $categoria->id, 'Ativo B', 'Sao Paulo', 'SP', 4.00, 120.00, true);
        $this->criarAnuncio($prestador->id, $categoria->id, 'Inativo', 'Sao Paulo', 'SP', 5.00, 90.00, false);

        $response = $this->get("{$this->base}/v2/service-search");

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        foreach ($response->json('data') as $item) {
            $this->assertTrue((bool) $item['is_active']);
        }
    }

    public function test_filtrar_por_categoria_retorna_apenas_da_categoria(): void
    {
        $eletricista = ServiceCategory::where('slug', 'eletricista')->first();
        $limpeza = ServiceCategory::where('slug', 'limpeza')->first();
        $prestador = $this->criarPrestador();

        $this->criarAnuncio($prestador->id, $eletricista->id, 'Instalacao eletrica', 'Sao Paulo', 'SP', 4.50, 100.00, true);
        $this->criarAnuncio($prestador->id, $limpeza->id, 'Faxina residencial', 'Sao Paulo', 'SP', 4.00, 120.00, true);

        $response = $this->get("{$this->base}/v2/service-search?category_id={$eletricista->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $this->assertSame('Instalacao eletrica', $response->json('data.0.title'));
    }

    public function test_filtrar_por_cidade_estado_e_avaliacao(): void
    {
        $categoria = ServiceCategory::first();
        $prestador = $this->criarPrestador();

        $this->criarAnuncio($prestador->id, $categoria->id, 'Servico SP', 'Sao Paulo', 'SP', 4.50, 200.00, true);
        $this->criarAnuncio($prestador->id, $categoria->id, 'Servico RJ', 'Rio de Janeiro', 'RJ', 3.00, 80.00, true);

        $response = $this->get("{$this->base}/v2/service-search"
            . "?city=Sao Paulo&state=SP&min_rating=4");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $this->assertSame('Sao Paulo', $response->json('data.0.city'));
        $this->assertTrue((float) $response->json('data.0.average_rating') >= 4);
    }

    public function test_filtrar_por_faixa_de_preco(): void
    {
        $categoria = ServiceCategory::first();
        $prestador = $this->criarPrestador();

        $this->criarAnuncio($prestador->id, $categoria->id, 'Barato', 'Sao Paulo', 'SP', 4.00, 50.00, true);
        $this->criarAnuncio($prestador->id, $categoria->id, 'Caro', 'Sao Paulo', 'SP', 4.00, 500.00, true);

        $response = $this->get("{$this->base}/v2/service-search"
            . "?min_price=100&max_price=300");

        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data');
    }

    public function test_busca_por_texto_q_encontra_titulo_e_descricao(): void
    {
        $categoria = ServiceCategory::first();
        $prestador = $this->criarPrestador();

        $this->criarAnuncio($prestador->id, $categoria->id, 'Encanador emergencial 24h', 'Sao Paulo', 'SP', 4.00, 150.00, true,
            'Reparos hidraulicos em geral');
        $this->criarAnuncio($prestador->id, $categoria->id, 'Jardinagem', 'Sao Paulo', 'SP', 4.00, 120.00, true,
            'Corte de grama e poda');

        $response = $this->get("{$this->base}/v2/service-search?q=encanador");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $this->assertStringContainsString('Encanador', $response->json('data.0.title'));
    }

    public function test_paginacao_respeita_limite(): void
    {
        $categoria = ServiceCategory::first();
        $prestador = $this->criarPrestador();

        for ($i = 1; $i <= 5; $i++) {
            $this->criarAnuncio($prestador->id, $categoria->id, "Servico {$i}", 'Sao Paulo', 'SP', 4.00, 100.00, true);
        }

        $response = $this->get("{$this->base}/v2/service-search?limit=2");

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $this->assertSame(2, $response->json('meta.per_page'));
        $this->assertSame(5, $response->json('meta.total'));
    }

    /** Helpers --------------------------------------------------------------- */

    private function criarPrestador(): ServiceProvider
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $user = User::factory()->create([
            'email' => 'prestador-' . uniqid() . '@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);

        return ServiceProvider::create([
            'user_id' => $user->id,
            'business_name' => 'Prestador Teste',
            'cnpj_cpf' => '12.345.678/' . uniqid() . '-90',
            'description' => 'Prestador para testes de busca',
            'is_active' => true,
        ]);
    }

    private function criarAnuncio(
        int $providerId,
        int $categoryId,
        string $title,
        string $city,
        string $state,
        float $rating,
        float $price,
        bool $isActive,
        ?string $description = null,
    ): ServiceListing {
        return ServiceListing::create([
            'provider_id' => $providerId,
            'category_id' => $categoryId,
            'title' => $title,
            'description' => $description ?? "Descricao de {$title}",
            'price' => $price,
            'price_type' => 'fixed',
            'address' => 'Rua de Teste, 100',
            'city' => $city,
            'state' => $state,
            'zip_code' => '01000-000',
            'latitude' => -23.5505,
            'longitude' => -46.6333,
            'is_active' => $isActive,
            'average_rating' => $rating,
            'total_reviews' => 0,
        ]);
    }
}
