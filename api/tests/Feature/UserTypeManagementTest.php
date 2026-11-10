<?php

namespace Tests\Feature;

use App\Models\FeatureFlag;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTypeManagementTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);

        // Módulo C1 liberado para os testes deste escopo (flag definida no seeder).
        FeatureFlag::where('name', 'ff_new_user_roles')->update(['enabled' => true]);
    }

    /** Helpers --------------------------------------------------------- */

    private function authHeader(string $roleName): array
    {
        $tipo = UserType::firstOrCreate(['nome' => $roleName], ['nome' => $roleName]);
        $email = "{$roleName}@teste.com";

        User::factory()->create([
            'email' => $email,
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);

        $login = $this->post('/api/login', [
            'email' => $email,
            'password' => 'senha123',
        ]);

        return ['Authorization' => 'Bearer '.$login->json('token')];
    }

    /** CRUD de papéis -------------------------------------------------- */

    public function test_admin_lista_papeis_de_usuario(): void
    {
        [$key, $value] = $this->authHeader('admin');

        $this->withHeader($key, $value)
            ->get("{$this->base}/user-types")
            ->assertStatus(200)
            ->assertJsonFragment(['nome' => 'admin'])
            ->assertJsonFragment(['nome' => 'consumer'])
            ->assertJsonFragment(['nome' => 'retailer'])
            ->assertJsonFragment(['nome' => 'provider'])
            ->assertJsonFragment(['nome' => 'industry']);
    }

    public function test_usuario_nao_admin_nao_pode_listar_papeis(): void
    {
        [$key, $value] = $this->authHeader('user');

        $this->withHeader($key, $value)
            ->get("{$this->base}/user-types")
            ->assertStatus(403);
    }

    public function test_admin_cria_novo_papel(): void
    {
        [$key, $value] = $this->authHeader('admin');

        $this->withHeader($key, $value)
            ->post("{$this->base}/user-types", [
                'nome' => 'assistente',
                'descricao' => 'Suporte operacional',
            ])
            ->assertStatus(201)
            ->assertJsonFragment(['nome' => 'assistente', 'descricao' => 'Suporte operacional']);

        $this->assertDatabaseHas('user_types', ['nome' => 'assistente']);
    }

    public function test_nao_cria_papel_com_nome_duplicado(): void
    {
        [$key, $value] = $this->authHeader('admin');

        $this->withHeader($key, $value)
            ->post("{$this->base}/user-types", ['nome' => 'admin'])
            ->assertStatus(422);
    }

    public function test_admin_atualiza_papel(): void
    {
        $tipo = UserType::where('nome', 'industry')->first();
        [$key, $value] = $this->authHeader('admin');

        $this->withHeader($key, $value)
            ->patch("{$this->base}/user-types/{$tipo->id}", [
                'nome' => 'indústria',
                'descricao' => 'Setor industrial',
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['nome' => 'indústria']);

        $this->assertDatabaseHas('user_types', ['nome' => 'indústria']);
    }

    public function test_admin_exclui_papel_sem_usuarios(): void
    {
        $tipo = UserType::where('nome', 'retailer')->first();
        [$key, $value] = $this->authHeader('admin');

        $this->withHeader($key, $value)
            ->delete("{$this->base}/user-types/{$tipo->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('user_types', ['id' => $tipo->id]);
    }

    public function test_nao_exclui_papel_com_usuarios_vinculados(): void
    {
        $tipo = UserType::where('nome', 'admin')->first();
        User::factory()->create([
            'email' => 'vinculado@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        [$key, $value] = $this->authHeader('admin');

        $this->withHeader($key, $value)
            ->delete("{$this->base}/user-types/{$tipo->id}")
            ->assertStatus(409);

        $this->assertDatabaseHas('user_types', ['id' => $tipo->id]);
    }

    public function test_com_flag_desabilitada_retorna_403(): void
    {
        FeatureFlag::where('name', 'ff_new_user_roles')->update(['enabled' => false]);
        [$key, $value] = $this->authHeader('admin');

        $this->withHeader($key, $value)
            ->post("{$this->base}/user-types", ['nome' => 'xpto'])
            ->assertStatus(403);
    }

    /** Vinculação de papel a usuário --------------------------------- */

    public function test_admin_vincula_papel_a_usuario(): void
    {
        $usuario = User::factory()->create([
            'email' => 'cliente@teste.com',
            'password' => bcrypt('senha123'),
        ]);
        $tipo = UserType::where('nome', 'provider')->first();
        [$key, $value] = $this->authHeader('admin');

        $this->withHeader($key, $value)
            ->patch("{$this->base}/auth/users/{$usuario->id}/role", [
                'tipo_id' => $tipo->id,
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['tipo_nome' => 'provider']);

        $this->assertDatabaseHas('users', ['id' => $usuario->id, 'tipo_id' => $tipo->id]);
    }

    public function test_usuario_nao_admin_nao_pode_vincular_papel(): void
    {
        $usuario = User::factory()->create([
            'email' => 'cliente2@teste.com',
            'password' => bcrypt('senha123'),
        ]);
        $tipo = UserType::where('nome', 'provider')->first();
        [$key, $value] = $this->authHeader('user');

        $this->withHeader($key, $value)
            ->patch("{$this->base}/auth/users/{$usuario->id}/role", [
                'tipo_id' => $tipo->id,
            ])
            ->assertStatus(403);
    }
}
