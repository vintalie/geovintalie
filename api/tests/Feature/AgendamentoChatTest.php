<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserType;
use App\Models\ServiceProvider;
use App\Models\Appointment;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgendamentoChatTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate:fresh', ['--force' => true]);
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /* Helpers ----------------------------------------------------------- */

    private function obterToken(string $tipoNome): string
    {
        $tipo = UserType::firstOrCreate(['nome' => $tipoNome], ['nome' => $tipoNome]);
        $email = "{$tipoNome}@teste.com";
        User::factory()->create(['email' => $email, 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);

        return $this->loginUsuario($email, 'senha123');
    }

    private function obterTokenParaUsuario(User $usuario): string
    {
        return $this->loginUsuario($usuario->email, 'senha123');
    }

    private function loginUsuario(string $email, string $senha): string
    {
        $login = $this->post('/api/login', ['email' => $email, 'password' => $senha]);
        return $login->json('token');
    }

    private function authHeader(string $token): array
    {
        return ['Authorization' => "Bearer {$token}"];
    }

    private function criarPrestadorAtivo(): array
    {
        $tipo = UserType::firstOrCreate(['nome' => 'provider'], ['nome' => 'provider']);
        $usuario = User::factory()->create([
            'email' => 'prestador@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        $provider = ServiceProvider::create([
            'user_id' => $usuario->id,
            'business_name' => 'Prestador Teste',
            'is_active' => true,
        ]);
        return ['usuario' => $usuario, 'provider' => $provider];
    }

    private function criarAgendamento(string $clientToken, int $providerId, array $overrides = [])
    {
        return $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/agendamentos", array_merge([
                'provider_id' => $providerId,
                'date' => now()->addDays(2)->toDateString(),
                'time' => '14:00',
                'valor' => 150.00,
                'observacoes' => 'Por favor, entrar no portao dos fundos.',
            ], $overrides));
    }

    /* Agendamentos ------------------------------------------------------ */

    public function test_cliente_pode_criar_agendamento_com_prestador_ativo(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();

        $response = $this->criarAgendamento($clientToken, $prestador['provider']->id);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'status' => 'pendente',
            'valor' => 150.00,
            'provider_id' => $prestador['provider']->id,
        ]);
        $this->assertDatabaseHas('appointments', [
            'status' => 'pendente',
            'provider_id' => $prestador['provider']->id,
        ]);
    }

    public function test_nao_pode_agendar_com_prestador_inativo(): void
    {
        $clientToken = $this->obterToken('user');
        $tipo = UserType::firstOrCreate(['nome' => 'provider'], ['nome' => 'provider']);
        $usuario = User::factory()->create(['email' => 'inativo@teste.com', 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);
        ServiceProvider::create(['user_id' => $usuario->id, 'business_name' => 'Inativo', 'is_active' => false]);

        $this->criarAgendamento($clientToken, $usuario->id ?? 0, ['provider_id' => ServiceProvider::where('user_id', $usuario->id)->value('id')])
            ->assertStatus(403);
    }

    public function test_criar_agendamento_campos_obrigatorios_retornam_422(): void
    {
        $clientToken = $this->obterToken('user');
        $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/agendamentos", [])
            ->assertStatus(422);
    }

    public function test_cliente_lista_somamente_seus_agendamentos(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();

        $this->criarAgendamento($clientToken, $prestador['provider']->id);
        $this->criarAgendamento($clientToken, $prestador['provider']->id, ['date' => now()->addDays(5)->toDateString()]);

        // Outro cliente nao deve ver estes agendamentos
        $outroToken = $this->obterToken('user');

        $response = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->get("{$this->base}/agendamentos");

        $response->assertStatus(200);
        $dados = $response->json('data') ?? [];
        $this->assertCount(2, $dados);
        foreach ($dados as $a) {
            $this->assertEquals('pendente', $a['status']);
        }

        $responseOutro = $this->withHeader('Authorization', "Bearer {$outroToken}")
            ->get("{$this->base}/agendamentos");
        $dadosOutro = $responseOutro->json('data') ?? [];
        $this->assertCount(0, $dadosOutro);
    }

    public function test_prestador_pode_confirmar_agendamento(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $providerToken = $this->obterToken('provider');

        $agendamento = $this->criarAgendamento($clientToken, $prestador['provider']->id);
        $id = $agendamento->json('id');

        // Prestador confirma
        $this->withHeader('Authorization', "Bearer {$providerToken}")
            ->patch("{$this->base}/agendamentos/{$id}", ['status' => 'confirmado', 'valor' => 160.00])
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'confirmado', 'valor' => 160.00]);

        $this->assertDatabaseHas('appointments', ['id' => $id, 'status' => 'confirmado']);
    }

    public function test_cliente_nao_pode_confirmar_agendamento(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();

        $agendamento = $this->criarAgendamento($clientToken, $prestador['provider']->id);
        $id = $agendamento->json('id');

        $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->patch("{$this->base}/agendamentos/{$id}", ['status' => 'confirmado'])
            ->assertStatus(403);
    }

    public function test_cliente_pode_cancelar_agendamento_pendente(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();

        $agendamento = $this->criarAgendamento($clientToken, $prestador['provider']->id);
        $id = $agendamento->json('id');

        $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->delete("{$this->base}/agendamentos/{$id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('appointments', ['id' => $id]);
    }

    public function test_nao_pode_cancelar_agendamento_ja_confirmado(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $providerToken = $this->obterToken('provider');

        $agendamento = $this->criarAgendamento($clientToken, $prestador['provider']->id);
        $id = $agendamento->json('id');

        $this->withHeader('Authorization', "Bearer {$providerToken}")
            ->patch("{$this->base}/agendamentos/{$id}", ['status' => 'confirmado']);

        $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->delete("{$this->base}/agendamentos/{$id}")
            ->assertStatus(403);
    }

    public function test_nao_participante_nao_acessa_agendamento(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $intrusoToken = $this->obterToken('user');

        $agendamento = $this->criarAgendamento($clientToken, $prestador['provider']->id);
        $id = $agendamento->json('id');

        $this->withHeader('Authorization', "Bearer {$intrusoToken}")
            ->get("{$this->base}/agendamentos/{$id}")
            ->assertStatus(403);
    }

    public function test_prestador_lista_seus_agendamentos_por_role(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $providerToken = $this->obterToken('provider');

        $this->criarAgendamento($clientToken, $prestador['provider']->id);

        $response = $this->withHeader('Authorization', "Bearer {$providerToken}")
            ->get("{$this->base}/agendamentos?role=provider");

        $response->assertStatus(200);
        $dados = $response->json('data') ?? [];
        $this->assertCount(1, $dados);
        $this->assertEquals($prestador['provider']->id, $dados[0]['provider_id']);
    }

    /* Chat -------------------------------------------------------------- */

    public function test_cliente_cria_conversa_com_prestador(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();

        $response = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas", ['provider_id' => $prestador['provider']->id]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('chat_conversations', [
            'client_id' => User::where('email', 'user@teste.com')->value('id'),
            'provider_id' => $prestador['provider']->id,
        ]);
    }

    public function test_criar_conversa_retorna_existente_para_o_mesmo_par(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();

        $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas", ['provider_id' => $prestador['provider']->id])
            ->assertStatus(201);

        $response = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas", ['provider_id' => $prestador['provider']->id]);

        $response->assertStatus(201);
        $this->assertCount(1, ChatConversation::where('client_id', User::where('email', 'user@teste.com')->value('id'))
            ->where('provider_id', $prestador['provider']->id)->get());
    }

    public function test_enviar_e_listar_mensagens_da_conversa(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $providerToken = $this->obterToken('provider');

        $conversa = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas", ['provider_id' => $prestador['provider']->id])
            ->json('id');

        // Cliente envia mensagem
        $envio = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", ['body' => 'Oi, tem disponibilidade para amanha?']);
        $envio->assertStatus(201);
        $envio->assertJsonFragment(['body' => 'Oi, tem disponibilidade para amanha?', 'is_mine' => true]);

        // Prestador lista mensagens (marca como lidas) e responde
        $listagem = $this->withHeader('Authorization', "Bearer {$providerToken}")
            ->get("{$this->base}/conversas/{$conversa}/mensagens");
        $listagem->assertStatus(200);
        $mensagens = $listagem->json('data') ?? [];
        $this->assertCount(1, $mensagens);
        $this->assertNotNull($mensagens[0]['read_at']);

        $resposta = $this->withHeader('Authorization', "Bearer {$providerToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", ['body' => 'Sim, tenho. Que horario prefere?']);
        $resposta->assertStatus(201);

        $depois = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->get("{$this->base}/conversas/{$conversa}/mensagens");
        $todos = $depois->json('data') ?? [];
        $this->assertCount(2, $todos);
    }

    public function test_nao_participante_nao_envia_mensagem(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $intrusoToken = $this->obterToken('user');

        $conversa = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas", ['provider_id' => $prestador['provider']->id])
            ->json('id');

        $this->withHeader('Authorization', "Bearer {$intrusoToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", ['body' => 'intrusao'])
            ->assertStatus(403);
    }

    public function test_conversa_nao_existente_retorna_404(): void
    {
        $clientToken = $this->obterToken('user');
        $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->get("{$this->base}/conversas/999999/mensagens")
            ->assertStatus(404);
    }
}
