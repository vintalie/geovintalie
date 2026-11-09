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

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Busca com filtros (Escopo B2) -------------------------------------- */

    public function test_busca_sem_filtros_retorna_apenas_servicos_ativos(): void
    {
        $prestador = $this->criarPrestador('Prestador Ativo');
        $categoria = ServiceCategory::first();

        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Limpeza residencial',
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'price' => 150.00,
            'average_rating' => 4.5,
            'is_active' => true,
        ]);

        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico inativo',
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'price' => 100.00,
            'is_active' => false,
        ]);

        $response = $this->get("{$this->base}/service-search");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertTrue($response->json('meta.total') >= 1);
    }

    public function test_filtrar_por_categoria_retorna_200(): void
    {
        $prestador = $this->criarPrestador('Prestador Categoria');
        $categoria = ServiceCategory::first();

        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Eletricista',
            'city' => 'Rio de Janeiro',
            'state' => 'RJ',
            'price' => 200.00,
            'is_active' => true,
        ]);

        $response = $this->get("{$this->base}/service-search", [
            'category_id' => $categoria->id,
        ]);

        $response->assertStatus(200);
        foreach ($response->json('data') as $item) {
            $this->assertEquals($categoria->id, $item['category_id']);
        }
    }

    public function test_filtrar_por_cidade_e_estado(): void
    {
        $prestador = $this->criarPrestador('Prestador Localidade');
        $categoria = ServiceCategory::first();

        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico BH',
            'city' => 'Belo Horizonte',
            'state' => 'MG',
            'price' => 100.00,
            'is_active' => true,
        ]);
        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico SP',
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'price' => 100.00,
            'is_active' => true,
        ]);

        $response = $this->get("{$this->base}/service-search", [
            'city' => 'Belo Horizonte',
            'state' => 'MG',
        ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Belo Horizonte', $data[0]['city']);
        $this->assertEquals('MG', $data[0]['state']);
    }

    public function test_filtrar_por_avaliacao_minima(): void
    {
        $prestador = $this->criarPrestador('Prestador Avaliacao');
        $categoria = ServiceCategory::first();

        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico 5 estrelas',
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'price' => 100.00,
            'average_rating' => 5.0,
            'is_active' => true,
        ]);
        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico 3 estrelas',
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'price' => 100.00,
            'average_rating' => 3.0,
            'is_active' => true,
        ]);

        $response = $this->get("{$this->base}/service-search", [
            'min_rating' => 4,
        ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Servico 5 estrelas', $data[0]['title']);
    }

    public function test_filtrar_por_faixa_de_preco(): void
    {
        $prestador = $this->criarPrestador('Prestador Preco');
        $categoria = ServiceCategory::first();

        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico barato',
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'price' => 50.00,
            'is_active' => true,
        ]);
        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico caro',
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'price' => 500.00,
            'is_active' => true,
        ]);

        $response = $this->get("{$this->base}/service-search", [
            'min_price' => 100,
            'max_price' => 300,
        ]);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(0, $data);
    }

    public function test_busca_por_texto_em_titulo_e_descricao(): void
    {
        $prestador = $this->criarPrestador('Prestador Texto');
        $categoria = ServiceCategory::first();

        ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Instalacao de ar-condicionado',
            'description' => 'Split e janela',
            'city' => 'Sao Paulo',
            'state' => 'SP',
            'price' => 300.00,
            'is_active' => true,
        ]);

        $response = $this->get("{$this->base}/service-search", [
            'q' => 'ar-condicionado',
        ]);

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_paginacao_respeita_limite(): void
    {
        $prestador = $this->criarPrestador('Prestador Pagina');
        $categoria = ServiceCategory::first();

        foreach (range(1, 25) as $i) {
            ServiceListing::create([
                'provider_id' => $prestador->id,
                'category_id' => $categoria->id,
                'title' => "Servico {$i}",
                'city' => 'Sao Paulo',
                'state' => 'SP',
                'price' => 100.00,
                'is_active' => true,
            ]);
        }

        $response = $this->get("{$this->base}/service-search", [
            'limit' => 10,
        ]);

        $response->assertStatus(200);
        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(10, $response->json('meta.per_page'));
        $this->assertEquals(3, $response->json('meta.last_page'));
    }

    public function test_parametros_invalidos_retornam_422(): void
    {
        $this->get("{$this->base}/service-search", [
            'min_rating' => 6,
        ])->assertStatus(422);

        $this->get("{$this->base}/service-search", [
            'limit' => 200,
        ])->assertStatus(422);

        $this->get("{$this->base}/service-search", [
            'category_id' => 999999,
        ])->assertStatus(422);
    }

    /* Helpers ----------------------------------------------------------- */

    private function criarPrestador(string $businessName): ServiceProvider
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $user = User::factory()->create([
            'email' => strtolower(str_replace(' ', '.', $businessName)).'@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);

        return ServiceProvider::create([
            'user_id' => $user->id,
            'business_name' => $businessName,
            'cnpj_cpf' => '12.345.678/0001-90',
        ]);
    }
}
