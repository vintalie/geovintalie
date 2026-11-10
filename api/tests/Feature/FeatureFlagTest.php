<?php

namespace Tests\Feature;

use App\Models\FeatureFlag;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Escopo C4 - Feature flags.
 *
 * Endpoints: GET /api/v2/feature-flags (autenticado) e
 * PATCH /api/v2/feature-flags/{name} (apenas admin).
 */
class FeatureFlagTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Helpers ----------------------------------------------------------- */

    private function token(string $tipoNome): string
    {
        $tipo = UserType::where('nome', $tipoNome)->firstOrFail();
        User::factory()->create([
            'email' => "{$tipoNome}@ff.test",
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $login = $this->post('/api/login', [
            'email' => "{$tipoNome}@ff.test",
            'password' => 'senha123',
        ]);
        $login->assertStatus(200);

        return $login->json('token');
    }

    private function authHeader(string $tipoNome): array
    {
        return ['Authorization' => "Bearer {$this->token($tipoNome)}"];
    }

    /** Listagem ---------------------------------------------------------- */

    public function test_listar_feature_flags_requer_autenticacao(): void
    {
        $this->get("{$this->base}/feature-flags")->assertStatus(401);
    }

    public function test_listar_flags_retorna_estrutura_e_padroes_desligados(): void
    {
        $headers = $this->authHeader('admin');

        $response = $this->withHeaders($headers)
            ->get("{$this->base}/feature-flags")
            ->assertStatus(200)
            ->assertJsonStructure(['data' => [
                ['name', 'description', 'enabled', 'rollout_percentage', 'is_enabled'],
            ]]);

        $flags = collect($response->json('data'))->keyBy('name');

        // Flags dos módulos R3 (A e B) nascem desligadas por padrão.
        foreach (['ff_b2_busca_filtros', 'ff_b3_recomendacao_ia', 'ff_a4_landing_seo', 'ff_a5_relatorios', 'ff_a6_quero_revender'] as $name) {
            $this->assertTrue($flags->has($name), "Flag {$name} deveria existir após o seed.");
            $this->assertFalse($flags->get($name)['enabled']);
            $this->assertFalse($flags->get($name)['is_enabled']);
        }
    }

    /** Atualização ------------------------------------------------------- */

    public function test_admin_pode_ativar_feature_flag(): void
    {
        $headers = $this->authHeader('admin');

        $this->withHeaders($headers)
            ->patch("{$this->base}/feature-flags/ff_b2_busca_filtros", [
                'enabled' => true,
                'rollout_percentage' => 100,
            ])
            ->assertStatus(200)
            ->assertJsonFragment([
                'name' => 'ff_b2_busca_filtros',
                'enabled' => true,
                'rollout_percentage' => 100,
                'is_enabled' => true,
            ]);

        $this->assertDatabaseHas('feature_flags', [
            'name' => 'ff_b2_busca_filtros',
            'enabled' => true,
            'rollout_percentage' => 100,
        ]);
    }

    public function test_nao_admin_nao_pode_alterar_feature_flag(): void
    {
        $headers = $this->authHeader('user');

        $this->withHeaders($headers)
            ->patch("{$this->base}/feature-flags/ff_b2_busca_filtros", ['enabled' => true])
            ->assertStatus(403);
    }

    public function test_alterar_flag_inexistente_retorna_404(): void
    {
        $headers = $this->authHeader('admin');

        $this->withHeaders($headers)
            ->patch("{$this->base}/feature-flags/ff_nao_existe", ['enabled' => true])
            ->assertStatus(404);
    }

    public function test_rollout_percentage_fora_do_intervalo_retorna_422(): void
    {
        $headers = $this->authHeader('admin');

        $this->withHeaders($headers)
            ->patch("{$this->base}/feature-flags/ff_b2_busca_filtros", [
                'enabled' => true,
                'rollout_percentage' => 150,
            ])
            ->assertStatus(422);
    }

    /** Service / model -------------------------------------------------- */

    public function test_flag_desconhecida_esta_desabilitada(): void
    {
        $this->assertFalse(app(\App\Services\FeatureFlagService::class)->isEnabled('ff_nao_existe'));
    }

    public function test_flag_desligada_esta_desabilitada(): void
    {
        FeatureFlag::create([
            'name' => 'ff_off',
            'description' => 'off',
            'enabled' => false,
            'rollout_percentage' => 100,
        ]);

        $this->assertFalse(app(\App\Services\FeatureFlagService::class)->isEnabled('ff_off'));
    }

    public function test_flag_ligada_em_100_esta_habilitada(): void
    {
        FeatureFlag::create([
            'name' => 'ff_on',
            'description' => 'on',
            'enabled' => true,
            'rollout_percentage' => 100,
        ]);

        $this->assertTrue(app(\App\Services\FeatureFlagService::class)->isEnabled('ff_on'));
    }
}
