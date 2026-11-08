<?php

namespace Tests\Feature;

use App\Models\ServiceCategory;
use App\Models\ServiceListing;
use App\Models\ServiceProvider;
use App\Models\Review;
use App\Models\Appointment;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /** Avaliacoes mutuas - endpoint /api/v2/reviews (Escopo B5) ----------- */

    public function test_criar_review_apos_servico_concluido_retorna_201(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        $avaliador = User::factory()->create([
            'email' => 'cliente.review@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);

        $prestadorUser = User::factory()->create([
            'email' => 'prestador.review@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => $prestadorUser->id,
            'business_name' => 'Servicos Review',
            'cnpj_cpf' => '12.345.678/0001-91',
        ]);

        $categoria = ServiceCategory::create([
            'name' => 'Limpeza',
            'slug' => 'limpeza-review-concluido',
        ]);

        $servico = ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Limpeza residencial',
            'price' => 150.00,
            'is_active' => true,
        ]);

        Appointment::create([
            'client_id' => $avaliador->id,
            'provider_id' => $prestador->id,
            'date' => '2026-11-10',
            'time' => '14:00',
            'status' => Appointment::STATUS_CONCLUIDO,
            'valor' => 150.00,
        ]);

        $token = $this->obterTokenDoUsuario($avaliador);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/v2/reviews", [
                'service_listing_id' => $servico->id,
                'service_provider_id' => $prestador->id,
                'rating' => 5,
                'comment' => 'Otimo servico, recomendo.',
            ]);

        $response->assertStatus(201);
        $response->assertJsonFragment(['rating' => 5, 'comment' => 'Otimo servico, recomendo.']);
        $this->assertDatabaseHas('service_evaluations', [
            'service_listing_id' => $servico->id,
            'service_provider_id' => $prestador->id,
            'evaluator_id' => $avaliador->id,
            'rating' => 5,
        ]);
    }

    public function test_listar_reviews_enviadas_por_role_sent(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        $avaliador = User::factory()->create([
            'email' => 'cliente.sent@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => User::factory()->create([
                'email' => 'prestador.sent@teste.com',
                'password' => bcrypt('senha123'),
                'tipo_id' => $tipo->id,
            ])->id,
            'business_name' => 'Servico Sent',
        ]);
        $categoria = ServiceCategory::create(['name' => 'Cat', 'slug' => 'cat-sent']);
        $servico = ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico',
        ]);

        Appointment::create([
            'client_id' => $avaliador->id,
            'provider_id' => $prestador->id,
            'date' => '2026-11-10',
            'time' => '14:00',
            'status' => Appointment::STATUS_CONCLUIDO,
            'valor' => 100.00,
        ]);

        Review::create([
            'service_listing_id' => $servico->id,
            'service_provider_id' => $prestador->id,
            'evaluator_id' => $avaliador->id,
            'rating' => 4,
            'comment' => 'Enviada pelo cliente.',
        ]);

        $token = $this->obterTokenDoUsuario($avaliador);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/v2/reviews?role=sent");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals(4, $data[0]['rating']);
        $this->assertArrayHasKey('evaluator', $data[0]);
    }

    public function test_listar_reviews_recebidas_por_role_received(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        $prestadorUser = User::factory()->create([
            'email' => 'prestador.received@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => $prestadorUser->id,
            'business_name' => 'Recebe Reviews',
        ]);
        $categoria = ServiceCategory::create(['name' => 'Cat', 'slug' => 'cat-received']);
        $servico = ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico',
        ]);

        $cliente = User::factory()->create([
            'email' => 'cliente.received@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);

        Appointment::create([
            'client_id' => $cliente->id,
            'provider_id' => $prestador->id,
            'date' => '2026-11-10',
            'time' => '14:00',
            'status' => Appointment::STATUS_CONCLUIDO,
            'valor' => 100.00,
        ]);

        Review::create([
            'service_listing_id' => $servico->id,
            'service_provider_id' => $prestador->id,
            'evaluator_id' => $cliente->id,
            'rating' => 3,
            'comment' => 'Recebida pelo prestador.',
        ]);

        // Outro prestador nao deve ver essa avaliacao como recebida.
        ServiceProvider::create([
            'user_id' => User::factory()->create([
                'email' => 'outro@teste.com',
                'password' => bcrypt('x'),
                'tipo_id' => $tipo->id,
            ])->id,
            'business_name' => 'Outro',
        ]);

        $token = $this->obterTokenDoUsuario($prestadorUser);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("{$this->base}/v2/reviews?role=received");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals(3, $data[0]['rating']);
        $this->assertArrayHasKey('evaluator', $data[0]);
        $this->assertEquals('cliente.received@teste.com', $data[0]['evaluator']['email']);
    }

    public function test_listar_reviews_sem_token_retorna_401(): void
    {
        $this->get("{$this->base}/v2/reviews")->assertStatus(401);
    }

    /* Helpers ----------------------------------------------------------- */

    private function obterTokenDoUsuario(User $user): string
    {
        $login = $this->post("{$this->base}/login", [
            'email' => $user->email,
            'password' => 'senha123',
        ]);
        $login->assertStatus(200);
        return $login->json('token');
    }
}
