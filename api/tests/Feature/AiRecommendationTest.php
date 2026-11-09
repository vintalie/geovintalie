<?php

namespace Tests\Feature;

use App\Models\AiRecommendation;
use App\Models\ServiceCategory;
use App\Models\ServiceListing;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Models\UserType;
use App\Models\FeatureFlag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiRecommendationTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Recomendacao por IA - POST /api/v2/ai-recommendations (Escopo B3) */

    public function test_sem_token_retorna_401(): void
    {
        $this->post("{$this->base}/ai-recommendations", [
            'problem_description' => 'Minha torneira esta vazando e entulhou a pia.',
        ])->assertStatus(401);
    }

    public function test_feature_flag_desabilitada_retorna_403(): void
    {
        $token = $this->obterToken('user');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/ai-recommendations", [
                'problem_description' => 'Minha torneira esta vazando e entulhou a pia.',
            ])
            ->assertStatus(403);
    }

    public function test_sugere_categoria_encanador_para_vazamento_retorna_201(): void
    {
        $this->ativarFlagB3();
        $token = $this->obterToken('user');

        $categoria = ServiceCategory::where('slug', 'encanador')->first();
        ServiceProvider::create([
            'user_id' => User::factory()->create(['email' => 'encanador@teste.com'])->id,
            'business_name' => 'Encanador Teste',
            'cnpj_cpf' => '11.222.333/0001-44',
            'is_active' => true,
        ]);
        ServiceListing::create([
            'provider_id' => 1,
            'category_id' => $categoria->id,
            'title' => 'Conserto de vazamento',
            'price' => 120.00,
            'is_active' => true,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/ai-recommendations", [
                'problem_description' => 'Minha torneira esta vazando e entulhou a pia do banheiro.',
            ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'suggested_category_name' => 'Encanador',
            'ai_provider' => 'heuristic',
        ]);
        $this->assertDatabaseHas('ai_recommendations', [
            'problem_description' => 'Minha torneira esta vazando e entulhou a pia do banheiro.',
            'ai_provider' => 'heuristic',
        ]);
    }

    public function test_descricao_muito_curta_retorna_422(): void
    {
        $this->ativarFlagB3();
        $token = $this->obterToken('user');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/ai-recommendations", [
                'problem_description' => 'curto',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['problem_description']);
    }

    public function test_sem_descricao_retorna_422(): void
    {
        $this->ativarFlagB3();
        $token = $this->obterToken('user');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/ai-recommendations", [])
            ->assertStatus(422);
    }

    /** Helpers ----------------------------------------------------------- */

    private function ativarFlagB3(): void
    {
        FeatureFlag::firstOrCreate(
            ['name' => 'ff_ai_recommendation'],
            ['enabled' => true, 'rollout_percentage' => 100, 'description' => 'B3 teste']
        );
    }

    private function obterToken(string $tipoNome): string
    {
        $tipo = UserType::firstOrCreate(['nome' => $tipoNome], ['nome' => $tipoNome]);
        $email = "{$tipoNome}@teste.com";
        User::factory()->create(['email' => $email, 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);

        $login = $this->post("{$this->base}/auth/login", [
            'email' => $email,
            'password' => 'senha123',
        ]);
        $login->assertStatus(200);
        return $login->json('token');
    }
}
