<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserType;
use App\Models\Property;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeovintalieApiTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Autenticação --------------------------------------------------------- */

    public function test_login_sucesso_retorna_token(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        User::factory()->create(['email' => 'cliente@teste.com', 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);

        $response = $this->post("{$this->base}/login", [
            'email' => 'cliente@teste.com',
            'password' => 'senha123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token']);
    }

    public function test_login_senha_errada_retorna_401(): void
    {
        UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        User::factory()->create(['email' => 'cliente@teste.com', 'password' => bcrypt('senha123')]);

        $this->post("{$this->base}/login", ['email' => 'cliente@teste.com', 'password' => 'errada'])
            ->assertStatus(401);
    }

    public function test_registro_cria_usuario(): void
    {
        UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $this->post("{$this->base}/register", [
            'name' => 'Novo Usuário',
            'email' => 'novo@teste.com',
            'password' => 'senha123',
        ])->assertStatus(201);

        $this->assertDatabaseHas('users', ['email' => 'novo@teste.com']);
    }

    public function test_me_sem_token_retorna_401(): void
    {
        $this->post("{$this->base}/auth/me")->assertStatus(401);
    }

    /** Propriedades -------------------------------------------------------- */

    public function test_listar_propriedades_requer_token(): void
    {
        $this->get("{$this->base}/auth/properties")->assertStatus(401);
    }

    public function test_criar_propriedade_com_rua_e_bairro_inexistentes_cria_automaticamente(): void
    {
        $token = $this->obterToken('user');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/auth/properties", [
                'name' => 'Loja Teste',
                'n_property' => '101',
                'street' => 'Rua Nova Inexistente',
                'neighborhood' => 'Bairro Novo Inexistente',
                'city' => 'São Paulo',
                'state' => 'São Paulo',
                'country' => 'Brasil',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('properties', ['name' => 'Loja Teste', 'n_property' => '101']);
        $this->assertDatabaseHas('streets', ['name' => 'Rua Nova Inexistente']);
        $this->assertDatabaseHas('neighborhoods', ['name' => 'Bairro Novo Inexistente']);
    }

    public function test_propriedade_campos_obrigatorios_retornam_422(): void
    {
        $token = $this->obterToken('user');
        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/auth/properties", [])
            ->assertStatus(422);
    }

    public function test_usuario_somente_ve_suas_propriedades(): void
    {
        $tokenUser = $this->obterToken('user');
        $this->withHeader('Authorization', "Bearer {$tokenUser}")
            ->post("{$this->base}/auth/properties", [
                'name' => 'Minha Loja',
                'n_property' => '201',
                'street' => 'Rua Minha',
            ]);

        $response = $this->withHeader('Authorization', "Bearer {$tokenUser}")
            ->get("{$this->base}/auth/properties");

        $response->assertStatus(200);
        $data = $response->json('propertys.data') ?? [];
        foreach ($data as $prop) {
            $this->assertEquals($this->usuarioIdDoToken($tokenUser), $prop['user_id']);
        }
    }

    /** Produtos ----------------------------------------------------------- */

    public function test_criar_produto_vinculado_a_propriedade(): void
    {
        $token = $this->obterToken('user');
        $property = $this->criarPropriedade($token, 'Loja Produto', '301');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/auth/products", [
                'name' => 'Produto X',
                'tipo' => 'alimento',
                'price' => 19.90,
                'property_id' => $property->id,
            ])->assertStatus(201);

        $this->assertDatabaseHas('products', ['name' => 'Produto X', 'property_id' => $property->id]);
    }

    /** Estoque ----------------------------------------------------------- */

    public function test_atualizar_estoque_soma_quantidade(): void
    {
        $token = $this->obterToken('user');
        $product = $this->criarProdutoVinculado($token);
        $stock = \App\Models\Stock::create([
            'product_id' => $product->id,
            'property_id' => $product->property_id,
            'value' => 10,
            'color' => 'azul',
            'size' => 'M',
            'quantity' => 5,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->put("{$this->base}/auth/products/{$product->id}/stocks/{$stock->id}", ['quantity' => 10])
            ->assertStatus(200)
            ->assertJsonFragment(['quantity' => 15]);

        $this->assertDatabaseHas('stocks', ['id' => $stock->id, 'product_id' => $product->id, 'quantity' => '15']);
    }

    /** Localização ------------------------------------------------------- */

    public function test_crud_pais(): void
    {
        $token = $this->obterToken('admin');
        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/auth/location/countries", ['name' => 'Brasil'])
            ->assertStatus(201);
    }

    /** Autorização ------------------------------------------------------- */

    public function test_usuario_nao_admin_nao_pode_listar_usuarios_403(): void
    {
        $token = $this->obterToken('user');
        $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/auth/user")
            ->assertStatus(403);
    }

    /* Helpers ----------------------------------------------------------- */

    private function obterToken(string $tipoNome): string
    {
        $tipo = UserType::firstOrCreate(['nome' => $tipoNome], ['nome' => $tipoNome]);
        $email = "{$tipoNome}@teste.com";
        User::factory()->create(['email' => $email, 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);

        $login = $this->post("{$this->base}/login", ['email' => $email, 'password' => 'senha123']);
        return $login->json('token');
    }

    private function usuarioIdDoToken(string $token): int
    {
        $parts = explode('.', $token);
        $payload = json_decode(base64_decode($parts[1] ?? '{}'), true);
        return (int) ($payload['sub'] ?? 1);
    }

    private function criarPropriedade(string $token, string $name, string $nProperty): Property
    {
        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/auth/properties", [
                'name' => $name,
                'n_property' => $nProperty,
                'street' => 'Rua de Teste',
            ])->assertStatus(201);
        return Property::where('name', $name)->first();
    }

    private function criarProdutoVinculado(string $token): Product
    {
        $property = $this->criarPropriedade($token, 'Loja Estoque', '401');
        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/auth/products", [
                'name' => 'Produto Estoque',
                'tipo' => 'geral',
                'price' => 10.00,
                'property_id' => $property->id,
            ])->assertStatus(201);
        return Product::where('property_id', $property->id)->first();
    }
}
