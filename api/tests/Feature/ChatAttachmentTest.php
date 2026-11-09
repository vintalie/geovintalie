<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserType;
use App\Models\ServiceProvider;
use App\Models\ChatMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ChatAttachmentTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        // O RefreshDatabase ja executa migrate:fresh; chamar novamente aqui
        // dispararia VACUUM dentro da transacao aberta pelo teste (SQLite :memory:).
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    /* Helpers ----------------------------------------------------------- */

    private function obterToken(string $tipoNome): string
    {
        $tipo = UserType::firstOrCreate(['nome' => $tipoNome], ['nome' => $tipoNome]);
        $email = "{$tipoNome}@teste.com";

        User::firstOrCreate(
            ['email' => $email],
            ['name' => ucfirst($tipoNome), 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]
        );

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

    private function criarConversa(string $clientToken, int $providerId): int
    {
        return $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas", ['provider_id' => $providerId])
            ->json('data.id');
    }

    /* Anexos ----------------------------------------------------------- */

    public function test_cliente_pode_enviar_mensagem_com_anexo(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $conversa = $this->criarConversa($clientToken, $prestador['provider']->id);

        $arquivo = UploadedFile::fake()->create('proposta.pdf', 100, 'application/pdf');

        $response = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", [
                'body' => 'Veja a proposta em anexo.',
                'file' => $arquivo,
            ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'body' => 'Veja a proposta em anexo.',
            'has_attachment' => true,
            'file_name' => 'proposta.pdf',
            'file_mime' => 'application/pdf',
        ]);

        $mensagem = ChatMessage::where('conversation_id', $conversa)->first();
        $this->assertNotNull($mensagem);
        $this->assertNotNull($mensagem->file_path);
        $this->assertFileExists(storage_path('app/public/' . $mensagem->file_path));
    }

    public function test_cliente_pode_enviar_apenas_arquivo_sem_corpo(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $conversa = $this->criarConversa($clientToken, $prestador['provider']->id);

        $arquivo = UploadedFile::fake()->create('foto.png', 50, 'image/png');

        $response = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", [
                'file' => $arquivo,
            ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'body' => '',
            'has_attachment' => true,
            'file_name' => 'foto.png',
        ]);
    }

    public function test_nao_pode_enviar_sem_corpo_nem_arquivo(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $conversa = $this->criarConversa($clientToken, $prestador['provider']->id);

        $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", [])
            ->assertStatus(422);
    }

    public function test_arquivo_com_tipo_nao_permitido_retorna_422(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $conversa = $this->criarConversa($clientToken, $prestador['provider']->id);

        $arquivo = UploadedFile::fake()->create('malware.exe', 10, 'application/x-msdownload');

        $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", [
                'body' => 'execute isso',
                'file' => $arquivo,
            ])
            ->assertStatus(422);
    }

    public function test_cliente_pode_baixar_anexo_da_mensagem(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $conversa = $this->criarConversa($clientToken, $prestador['provider']->id);

        $conteudo = '%PDF-1.4 conteudo fake do relatorio';
        $arquivo = UploadedFile::fake()->createWithContent('relatorio.pdf', $conteudo);

        $mensagemId = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", [
                'body' => 'Relatorio',
                'file' => $arquivo,
            ])
            ->json('data.id');

        $download = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->get("{$this->base}/messages/{$mensagemId}/file");

        $download->assertStatus(200);
        $download->assertSee($conteudo);
        $download->assertHeader('Content-Type', 'application/pdf');
        $download->assertHeaderContains('Content-Disposition', 'relatorio.pdf');
    }

    public function test_download_de_mensagem_sem_anexo_retorna_404(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $conversa = $this->criarConversa($clientToken, $prestador['provider']->id);

        $mensagemId = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", ['body' => 'apenas texto'])
            ->json('data.id');

        $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->get("{$this->base}/messages/{$mensagemId}/file")
            ->assertStatus(404);
    }

    public function test_nao_participante_nao_baixa_anexo(): void
    {
        $clientToken = $this->obterToken('user');
        $prestador = $this->criarPrestadorAtivo();
        $intrusoToken = $this->obterToken('intruso');
        $conversa = $this->criarConversa($clientToken, $prestador['provider']->id);

        $arquivo = UploadedFile::fake()->create('documento.txt', 20, 'text/plain');
        $mensagemId = $this->withHeader('Authorization', "Bearer {$clientToken}")
            ->post("{$this->base}/conversas/{$conversa}/mensagens", [
                'body' => 'intrusao',
                'file' => $arquivo,
            ])
            ->json('data.id');

        $this->withHeader('Authorization', "Bearer {$intrusoToken}")
            ->get("{$this->base}/messages/{$mensagemId}/file")
            ->assertStatus(403);
    }
}
