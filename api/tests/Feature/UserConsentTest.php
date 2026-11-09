<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Escopo C3 - LGPD: consentimento por finalidade, exportacao de dados
 * e direito ao esquecimento (exclusao/anonymizacao de conta).
 *
 * Endpoints sob /api/v2/user-consents/* (autenticados via JWT).
 */
class UserConsentTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Helpers ----------------------------------------------------------- */

    private function authHeader(): array
    {
        UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $tipoId = UserType::where('nome', 'user')->value('id');

        $user = User::factory()->create([
            'email'    => 'cliente@lgpd.test',
            'password' => bcrypt('senha123'),
            'tipo_id'  => $tipoId,
            'phone'    => '(11) 99999-9999',
        ]);

        $login = $this->post('/api/login', [
            'email'    => 'cliente@lgpd.test',
            'password' => 'senha123',
        ]);
        $login->assertStatus(200);

        return [
            'token' => $login->json('token'),
            'user'  => $user,
        ];
    }

    /** Consentimento por finalidade -------------------------------------- */

    public function test_listar_consentimentos_retorna_vazio_inicialmente(): void
    {
        $auth = $this->authHeader();

        $this->withHeader('Authorization', "Bearer {$auth['token']}")
            ->get("{$this->base}/user-consents")
            ->assertStatus(200)
            ->assertJson(['data' => []]);
    }

    public function test_registrar_consentimento_de_finalidade(): void
    {
        $auth = $this->authHeader();

        $this->withHeader('Authorization', "Bearer {$auth['token']}")
            ->post("{$this->base}/user-consents", [
                'purpose' => 'marketing',
                'granted' => true,
            ])
            ->assertStatus(201)
            ->assertJsonFragment(['purpose' => 'marketing', 'granted' => true]);

        $this->assertDatabaseHas('user_consents', [
            'user_id' => $auth['user']->id,
            'purpose' => 'marketing',
            'granted' => true,
        ]);
    }

    public function test_revogar_consentimento_por_finalidade(): void
    {
        $auth = $this->authHeader();

        $this->withHeader('Authorization', "Bearer {$auth['token']}")
            ->post("{$this->base}/user-consents", [
                'purpose' => 'analytics',
                'granted' => true,
            ])->assertStatus(201);

        $this->withHeader('Authorization', "Bearer {$auth['token']}")
            ->delete("{$this->base}/user-consents/analytics")
            ->assertStatus(200);

        $this->assertDatabaseMissing('user_consents', [
            'user_id' => $auth['user']->id,
            'purpose' => 'analytics',
        ]);
    }

    /** Exportacao de dados pessoais (acesso e portabilidade) ------------- */

    public function test_exportar_dados_pessoais_do_titular(): void
    {
        $auth = $this->authHeader();

        $response = $this->withHeader('Authorization', "Bearer {$auth['token']}")
            ->get("{$this->base}/user-consents/export");
        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'data' => ['user'], 'exported_at']);
        $response->assertJsonFragment([
            'email' => 'cliente@lgpd.test',
            'phone' => '(11) 99999-9999',
        ]);
    }

    /** Direito ao esquecimento (exclusao / anonymizacao de conta) -------- */

    public function test_excluir_conta_senha_errada_retorna_401(): void
    {
        $auth = $this->authHeader();

        $this->withHeader('Authorization', "Bearer {$auth['token']}")
            ->delete("{$this->base}/user-consents/account", [
                'password'       => 'senha_errada',
                'confirm_delete' => true,
            ])
            ->assertStatus(401);
    }

    public function test_excluir_conta_sem_confirmacao_retorna_422(): void
    {
        $auth = $this->authHeader();

        $this->withHeader('Authorization', "Bearer {$auth['token']}")
            ->delete("{$this->base}/user-consents/account", [
                'password' => 'senha123',
            ])
            ->assertStatus(422);
    }

    public function test_excluir_conta_anonimiza_dados_do_titular(): void
    {
        $auth = $this->authHeader();
        $userId = $auth['user']->id;

        // Um consentimento ativo deve ser removido junto com a conta.
        $this->withHeader('Authorization', "Bearer {$auth['token']}")
            ->post("{$this->base}/user-consents", [
                'purpose' => 'marketing',
                'granted' => true,
            ])->assertStatus(201);

        $response = $this->withHeader('Authorization', "Bearer {$auth['token']}")
            ->delete("{$this->base}/user-consents/account", [
                'password'       => 'senha123',
                'confirm_delete' => true,
            ]);
        $response->assertStatus(200);
        $this->assertStringContainsString('Conta excluída', $response->json('message'));

        // Titular anonymizado (registro mantido por integridade de FKs).
        $this->assertDatabaseHas('users', [
            'id'      => $userId,
            'name'    => 'Usuario Excluido',
            'email'   => "deleted_{$userId}@deleted.local",
            'phone'   => null,
        ]);

        $this->assertDatabaseMissing('user_consents', [
            'user_id' => $userId,
        ]);
    }
}
