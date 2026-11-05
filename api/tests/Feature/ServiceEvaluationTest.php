<?php

namespace Tests\Feature;

use App\Models\ServiceCategory;
use App\Models\ServiceEvaluation;
use App\Models\ServiceListing;
use App\Models\ServiceProvider;
use App\Models\Appointment;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceEvaluationTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api';

    protected function setUp(): void
    {
        parent::setUp();
        fwrite(STDERR, "\nDEBUG setUp categorias ANTES do seed: ".\App\Models\ServiceCategory::count()."\n");
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
        fwrite(STDERR, "DEBUG setUp categorias DEPOIS do seed: ".\App\Models\ServiceCategory::count()."\n");
    }

    /** Avaliacoes mutuas (Escopo B5) --------------------------------------- */

    public function test_criar_avaliacao_apos_servico_concluido_retorna_201(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        $avaliador = User::factory()->create([
            'email' => 'cliente@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);

        $prestadorUser = User::factory()->create([
            'email' => 'prestador@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => $prestadorUser->id,
            'business_name' => 'Servicos Teste',
            'cnpj_cpf' => '12.345.678/0001-90',
            'description' => 'Prestador de teste',
        ]);

        $categoria = ServiceCategory::create([
            'name' => 'Limpeza',
            'slug' => 'limpeza-avaliacao-concluido',
        ]);

        $servico = ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Limpeza residencial',
            'description' => 'Servico concluido',
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
            ->post("{$this->base}/v2/service-evaluations", [
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

        // O prestador deve ter media e total atualizados.
        $this->assertDatabaseHas('service_providers', [
            'id' => $prestador->id,
            'average_rating' => 5.00,
            'total_reviews' => 1,
        ]);
    }

    public function test_criar_avaliacao_sem_token_retorna_401(): void
    {
        $this->post("{$this->base}/v2/service-evaluations", [
            'service_listing_id' => 1,
            'service_provider_id' => 1,
            'rating' => 5,
        ])->assertStatus(401);
    }

    public function test_nota_para_fora_de_intervalo_retorna_422(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $avaliador = User::factory()->create([
            'email' => 'cliente2@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $token = $this->obterTokenDoUsuario($avaliador);

        foreach ([0, 6] as $notaInvalida) {
            $this->withHeader('Authorization', "Bearer {$token}")
                ->post("{$this->base}/v2/service-evaluations", [
                    'service_listing_id' => 1,
                    'service_provider_id' => 1,
                    'rating' => $notaInvalida,
                ])
                ->assertStatus(422);
        }
    }

    public function test_nao_permite_auto_avaliacao_retorna_403(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        $prestadorUser = User::factory()->create([
            'email' => 'prestador3@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => $prestadorUser->id,
            'business_name' => 'Auto Avaliacao',
        ]);

        $categoria = ServiceCategory::create(['name' => 'X', 'slug' => 'x']);
        $servico = ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico',
        ]);

        $token = $this->obterTokenDoUsuario($prestadorUser);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/v2/service-evaluations", [
                'service_listing_id' => $servico->id,
                'service_provider_id' => $prestador->id,
                'rating' => 4,
            ])
            ->assertStatus(403);
    }

    public function test_nao_permite_duplicata_mesmo_servico_retorna_409(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        $avaliador = User::factory()->create([
            'email' => 'cliente4@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestadorUser = User::factory()->create([
            'email' => 'prestador4@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => $prestadorUser->id,
            'business_name' => 'Duplicata',
        ]);
        $categoria = ServiceCategory::create(['name' => 'Y', 'slug' => 'y']);
        $servico = ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico',
        ]);

        $token = $this->obterTokenDoUsuario($avaliador);

        // O cliente precisa ter um agendamento concluido para poder avaliar.
        Appointment::create([
            'client_id' => $avaliador->id,
            'provider_id' => $prestador->id,
            'date' => '2026-11-10',
            'time' => '14:00',
            'status' => Appointment::STATUS_CONCLUIDO,
            'valor' => 150.00,
        ]);

        ServiceEvaluation::create([
            'service_listing_id' => $servico->id,
            'service_provider_id' => $prestador->id,
            'evaluator_id' => $avaliador->id,
            'rating' => 4,
            'comment' => 'Primeira',
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/v2/service-evaluations", [
                'service_listing_id' => $servico->id,
                'service_provider_id' => $prestador->id,
                'rating' => 3,
                'comment' => 'Segunda',
            ])
            ->assertStatus(409);
    }

    public function test_listar_avaliacoes_do_prestador_retorna_200_com_dados(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        $prestadorUser = User::factory()->create([
            'email' => 'prestador5@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => $prestadorUser->id,
            'business_name' => 'Listagem',
        ]);
        $categoria = ServiceCategory::create(['name' => 'Z', 'slug' => 'z']);

        $evaluations = [];
        for ($i = 1; $i <= 3; $i++) {
            $avaliador = User::factory()->create([
                'email' => "avaliador{$i}@teste.com",
                'password' => bcrypt('senha123'),
                'tipo_id' => $tipo->id,
            ]);
            $servico = ServiceListing::create([
                'provider_id' => $prestador->id,
                'category_id' => $categoria->id,
                'title' => "Servico {$i}",
            ]);
            $evaluations[] = ServiceEvaluation::create([
                'service_listing_id' => $servico->id,
                'service_provider_id' => $prestador->id,
                'evaluator_id' => $avaliador->id,
                'rating' => $i,
                'comment' => "Comentario {$i}",
            ]);
        }

        $response = $this->get("{$this->base}/v2/service-providers/{$prestador->id}/evaluations");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(3, $data);
        $ratings = array_column($data, 'rating');
        $this->assertEquals([3, 2, 1], $ratings); // orderByDesc created_at
        $this->assertArrayHasKey('evaluator', $data[0]);
        $this->assertArrayHasKey('name', $data[0]['evaluator']);
    }

    public function test_listar_avaliacoes_do_prestador_sem_avaliacoes_retorna_vazio(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $prestadorUser = User::factory()->create([
            'email' => 'prestador6@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => $prestadorUser->id,
            'business_name' => 'Sem Avaliacoes',
        ]);

        $response = $this->get("{$this->base}/v2/service-providers/{$prestador->id}/evaluations");
        $response->assertStatus(200);
        $this->assertEquals([], $response->json('data'));
    }

    public function test_nao_permite_avaliacao_sem_agendamento_concluido_retorna_403(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        $avaliador = User::factory()->create([
            'email' => 'cliente7@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestadorUser = User::factory()->create([
            'email' => 'prestador7@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => $prestadorUser->id,
            'business_name' => 'Sem Contratacao',
        ]);
        $categoria = ServiceCategory::create(['name' => 'W', 'slug' => 'w']);
        $servico = ServiceListing::create([
            'provider_id' => $prestador->id,
            'category_id' => $categoria->id,
            'title' => 'Servico',
        ]);

        // Sem qualquer agendamento.
        $token = $this->obterTokenDoUsuario($avaliador);
        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/v2/service-evaluations", [
                'service_listing_id' => $servico->id,
                'service_provider_id' => $prestador->id,
                'rating' => 4,
            ])
            ->assertStatus(403);

        // Agendamento pendente nao autoriza avaliacao.
        Appointment::create([
            'client_id' => $avaliador->id,
            'provider_id' => $prestador->id,
            'date' => '2026-11-10',
            'time' => '14:00',
            'status' => Appointment::STATUS_PENDENTE,
            'valor' => 150.00,
        ]);
        $this->withHeader('Authorization', "Bearer {$token}")
            ->post("{$this->base}/v2/service-evaluations", [
                'service_listing_id' => $servico->id,
                'service_provider_id' => $prestador->id,
                'rating' => 4,
            ])
            ->assertStatus(403);

        $this->assertDatabaseMissing('service_evaluations', [
            'service_listing_id' => $servico->id,
            'evaluator_id' => $avaliador->id,
        ]);
    }

    public function test_calcula_media_de_notas_no_perfil_do_prestador(): void
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);

        $prestadorUser = User::factory()->create([
            'email' => 'prestador8@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $prestador = ServiceProvider::create([
            'user_id' => $prestadorUser->id,
            'business_name' => 'Media Notas',
        ]);
        $categoria = ServiceCategory::create(['name' => 'V', 'slug' => 'v']);

        $ratings = [5, 3];
        foreach ($ratings as $index => $rating) {
            $cliente = User::factory()->create([
                'email' => "cliente_media_{$index}@teste.com",
                'password' => bcrypt('senha123'),
                'tipo_id' => $tipo->id,
            ]);
            $servico = ServiceListing::create([
                'provider_id' => $prestador->id,
                'category_id' => $categoria->id,
                'title' => "Servico {$index}",
            ]);
            Appointment::create([
                'client_id' => $cliente->id,
                'provider_id' => $prestador->id,
                'date' => '2026-11-10',
                'time' => '14:00',
                'status' => Appointment::STATUS_CONCLUIDO,
                'valor' => 100.00,
            ]);
            $token = $this->obterTokenDoUsuario($cliente);
            $this->withHeader('Authorization', "Bearer {$token}")
                ->post("{$this->base}/v2/service-evaluations", [
                    'service_listing_id' => $servico->id,
                    'service_provider_id' => $prestador->id,
                    'rating' => $rating,
                    'comment' => "Comentario {$index}",
                ])
                ->assertStatus(201);
        }

        // Media no perfil do prestador.
        $this->assertDatabaseHas('service_providers', [
            'id' => $prestador->id,
            'average_rating' => 4.00,
            'total_reviews' => 2,
        ]);
        $this->assertDatabaseHas('service_listings', [
            'id' => $servico->id,
            'average_rating' => 3.00,
            'total_reviews' => 1,
        ]);

        // Listagem publica de avaliacoes do prestador.
        $response = $this->get("{$this->base}/v2/service-providers/{$prestador->id}/evaluations");
        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
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
