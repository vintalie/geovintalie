<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserType;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTypeTest extends TestCase
{
    use RefreshDatabase;

    private string $authBase = '/api/v2/auth';
    private string $loginUrl = '/api/login';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Papéis ----------------------------------------------------------- */

    public function test_cadastra_os_papeis_do_escopo_c1(): void
    {
        $nomes = UserType::pluck('nome')->toArray();

        $this->assertContains('admin', $nomes);
        $this->assertContains('consumidor', $nomes);
        $this->assertContains('lojista', $nomes);
        $this->assertContains('prestador', $nomes);
        $this->assertContains('indústria', $nomes);
    }

    public function test_admin_pode_listar_papeis(): void
    {
        $this->authAs('admin')
            ->get("{$this->authBase}/user-types")
            ->assertStatus(200)
            ->assertJsonStructure([0 => ['id', 'nome', 'permissions']]);
    }

    public function test_nao_admin_nao_pode_listar_papeis_retorna_403(): void
    {
        $this->authAs('consumidor')
            ->get("{$this->authBase}/user-types")
            ->assertStatus(403);
    }

    public function test_listar_papeis_sem_token_retorna_401(): void
    {
        $this->get("{$this->authBase}/user-types")->assertStatus(401);
    }

    public function test_admin_pode_criar_papel(): void
    {
        $this->authAs('admin')
            ->post("{$this->authBase}/user-types", ['nome' => 'estagiario'])
            ->assertStatus(201)
            ->assertJsonFragment(['nome' => 'estagiario']);

        $this->assertDatabaseHas('user_types', ['nome' => 'estagiario']);
    }

    public function test_nao_pode_criar_papel_com_nome_duplicado(): void
    {
        $this->authAs('admin')
            ->post("{$this->authBase}/user-types", ['nome' => 'admin'])
            ->assertStatus(422);
    }

    public function test_admin_pode_atualizar_papel(): void
    {
        $papel = UserType::firstOrCreate(['nome' => 'revisor'], ['nome' => 'revisor']);

        $this->authAs('admin')
            ->put("{$this->authBase}/user-types/{$papel->id}", ['nome' => 'revisor_senior'])
            ->assertStatus(200)
            ->assertJsonFragment(['nome' => 'revisor_senior']);

        $this->assertDatabaseMissing('user_types', ['id' => $papel->id, 'nome' => 'revisor']);
        $this->assertDatabaseHas('user_types', ['id' => $papel->id, 'nome' => 'revisor_senior']);
    }

    public function test_admin_pode_excluir_papel(): void
    {
        $papel = UserType::firstOrCreate(['nome' => 'excluavel'], ['nome' => 'excluavel']);

        $this->authAs('admin')
            ->delete("{$this->authBase}/user-types/{$papel->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('user_types', ['id' => $papel->id]);
    }

    /** Permissoes ------------------------------------------------------ */

    public function test_admin_pode_sincronizar_permissoes_de_um_papel(): void
    {
        $papel = UserType::where('nome', 'consumidor')->first();
        $permissao = Permission::firstOrCreate(['nome' => 'gerenciar_propriedades']);

        $this->authAs('admin')
            ->put("{$this->authBase}/user-types/{$papel->id}/permissions", [
                'permission_ids' => [$permissao->id],
            ])
            ->assertStatus(200)
            ->assertJsonFragment([
                'permissions' => [['id' => $permissao->id, 'nome' => 'gerenciar_propriedades']],
            ]);

        $this->assertTrue($papel->refresh()->permissions->contains('nome', 'gerenciar_propriedades'));
    }

    public function test_nao_admin_nao_pode_sincronizar_permissoes_retorna_403(): void
    {
        $papel = UserType::where('nome', 'admin')->first();

        $this->authAs('lojista')
            ->put("{$this->authBase}/user-types/{$papel->id}/permissions", ['permission_ids' => []])
            ->assertStatus(403);
    }

    /** Papel do usuario ------------------------------------------------- */

    public function test_admin_pode_alterar_o_papel_de_um_usuario(): void
    {
        $tipoConsumidor = UserType::where('nome', 'consumidor')->first();
        $usuario = User::factory()->create([
            'email' => 'cliente@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipoConsumidor->id,
        ]);

        $tipoLoja = UserType::where('nome', 'lojista')->first();

        $this->authAs('admin')
            ->put("{$this->authBase}/users/{$usuario->id}/role", ['tipo_id' => $tipoLoja->id])
            ->assertStatus(200)
            ->assertJsonFragment(['tipo_nome' => 'lojista']);

        $this->assertDatabaseHas('users', ['id' => $usuario->id, 'tipo_id' => $tipoLoja->id]);
    }

    public function test_nao_admin_nao_pode_alterar_papel_de_usuario_retorna_403(): void
    {
        $usuario = User::factory()->create(['email' => 'outro@teste.com', 'password' => bcrypt('senha123')]);

        $this->authAs('consumidor')
            ->put("{$this->authBase}/users/{$usuario->id}/role", ['tipo_id' => 1])
            ->assertStatus(403);
    }

    /** Helpers --------------------------------------------------------- */

    private function authAs(string $roleName)
    {
        $tipo = UserType::firstOrCreate(['nome' => $roleName], ['nome' => $roleName]);
        $email = strtolower(str_replace(['ã', 'á', 'í'], ['a', 'a', 'i'], $roleName)).'@teste.com';
        User::factory()->create([
            'email' => $email,
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);

        $login = $this->post($this->loginUrl, ['email' => $email, 'password' => 'senha123']);
        $token = $login->json('token');

        return $this->withHeader('Authorization', 'Bearer '.$token);
    }
}
