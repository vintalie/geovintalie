<?php

namespace Tests\Feature;

use App\Models\GoogleBusinessToken;
use App\Models\User;
use App\Models\UserType;
use App\Services\GoogleBusinessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class GoogleBusinessTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2/google-business';

    private function serviceDeTeste(): void
    {
        Config::set('google_business.client_id', 'test-client-id-sandbox');
        Config::set('google_business.client_secret', 'test-client-secret-sandbox');
        Config::set('google_business.redirect_uri', 'http://localhost:8000/api/v2/google-business/callback');
        Config::set('google_business.frontend_redirect_uri', null);

        $this->app->instance(
            GoogleBusinessService::class,
            GoogleBusinessService::makeFromConfig()
        );
    }

    private function autenticar(): array
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $user = User::factory()->create([
            'email'    => 'googlebusiness@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id'  => $tipo->id,
        ]);

        $token = JWTAuth::fromUser($user);
        JWTAuth::setUser($user);

        return ['user' => $user, 'token' => $token];
    }

    private function estadoAssinado(int $userId): string
    {
        $payload = json_encode([
            'u' => $userId,
            'n' => Str::random(24),
            't' => now()->timestamp,
        ]);

        return base64_encode($payload . '.' . hash_hmac('sha256', $payload, config('app.key')));
    }

    /** Autorizacao OAuth 2.0 --------------------------------------------- */

    public function test_autorizacao_sem_credenciais_retorna_500(): void
    {
        Config::set('google_business.client_id', null);
        Config::set('google_business.client_secret', null);
        Config::set('google_business.redirect_uri', null);

        $this->app->instance(
            GoogleBusinessService::class,
            GoogleBusinessService::makeFromConfig()
        );

        $this->get("{$this->base}/auth/redirect")
            ->assertStatus(500);
    }

    public function test_autorizacao_redireciona_para_tela_de_consentimento_google(): void
    {
        $this->autenticar();
        $this->serviceDeTeste();

        $resposta = $this->get("{$this->base}/auth/redirect");

        $resposta->assertStatus(302);
        $this->assertStringStartsWith(
            'https://accounts.google.com/o/oauth2/v2/auth?',
            $resposta->headers->get('location')
        );
        $this->assertStringContainsString('access_type=offline', $resposta->headers->get('location'));
        $this->assertStringContainsString('prompt=consent', $resposta->headers->get('location'));
    }

    public function test_callback_sucesso_salva_tokens_do_usuario(): void
    {
        $dados = $this->autenticar();
        $this->serviceDeTeste();

        Http::fake([
            'oauth2.googleapis.com*' => Http::response([
                'access_token'  => 'ya29.access-teste',
                'refresh_token' => 'ya29.refresh-teste',
                'expires_in'    => 3600,
                'token_type'    => 'Bearer',
            ], 200),
            'mybusinessbusinessinformation.googleapis.com/v1*' => Http::response([
                'accounts' => [
                    ['name' => 'accounts/123', 'accountName' => 'Conta Teste', 'displayName' => 'Conta Teste'],
                ],
            ], 200),
        ]);

        $resposta = $this->get(
            "{$this->base}/callback?code=codigo-autorizacao&state={$this->estadoAssinado($dados['user']->id)}"
        );

        $resposta->assertStatus(200)
            ->assertJsonFragment(['message' => 'Autorizacao com o Google Business Profile concluida com sucesso. Tokens salvos.']);

        $this->assertDatabaseHas('google_business_tokens', [
            'user_id'         => $dados['user']->id,
            'google_account_id'   => 'accounts/123',
            'google_account_name' => 'Conta Teste',
            'scopes'          => 'https://www.googleapis.com/auth/business.manage',
        ]);
    }

    public function test_callback_com_error_do_google_retorna_400(): void
    {
        $this->autenticar();

        $resposta = $this->get(
            "{$this->base}/callback?error=access_denied&state={$this->estadoAssinado(1)}"
        );

        $resposta->assertStatus(400);
    }

    public function test_callback_com_state_invalido_retorna_400(): void
    {
        $this->autenticar();

        $this->get("{$this->base}/callback?code=x&state=estado-invalido")
            ->assertStatus(400);
    }

    /** Contas e locais ----------------------------------------------------- */

    public function test_listar_contas_retorna_dados_do_google(): void
    {
        $dados = $this->autenticar();
        $this->serviceDeTeste();

        Http::fake([
            'mybusinessbusinessinformation.googleapis.com/v1*' => Http::response([
                'accounts' => [
                    ['name' => 'accounts/123', 'accountName' => 'Conta Teste'],
                ],
            ], 200),
        ]);

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->get("{$this->base}/accounts")
            ->assertStatus(200)
            ->assertJsonStructure(['message', 'data'])
            ->assertJsonCount(1, 'data');
    }

    public function test_listar_contas_sem_autenticacao_retorna_401(): void
    {
        $this->get("{$this->base}/accounts")->assertStatus(401);
    }

    public function test_listar_locais_de_uma_conta(): void
    {
        $dados = $this->autenticar();
        $this->serviceDeTeste();

        Http::fake([
            'mybusinessbusinessinformation.googleapis.com/v1*' => Http::response([
                'locations' => [
                    ['name' => 'accounts/123/locations/456', 'title' => 'Loja Teste'],
                ],
            ], 200),
        ]);

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->get("{$this->base}/accounts/123/locations")
            ->assertStatus(200)
            ->assertJsonStructure(['message', 'account', 'data'])
            ->assertJsonCount(1, 'data');
    }

    public function test_sincronizar_perfil_salva_dados_no_token_do_usuario(): void
    {
        $dados = $this->autenticar();
        $this->serviceDeTeste();

        $token = GoogleBusinessToken::create([
            'user_id'                 => $dados['user']->id,
            'access_token_encrypted'  => Crypt::encryptString('ya29.access-teste'),
            'scopes'                  => 'https://www.googleapis.com/auth/business.manage',
        ]);

        Http::fake([
            'mybusinessbusinessinformation.googleapis.com/v1*' => Http::response([
                'name'  => 'accounts/123/locations/456',
                'title' => 'Loja Teste Sincronizada',
                'addresses' => [
                    ['addressLines' => ['Rua dos Testes, 100'], 'locality' => 'Sao Paulo', 'postalCode' => '01000-000'],
                ],
                'phones' => [['value' => '+5511999999999']],
                'regularHours' => [
                    'periods' => [
                        ['openDay' => 'MONDAY', 'openTime' => '09:00', 'closeDay' => 'MONDAY', 'closeTime' => '18:00'],
                    ],
                ],
            ], 200),
        ]);

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->get("{$this->base}/accounts/123/locations/456")
            ->assertStatus(200)
            ->assertJsonFragment(['title' => 'Loja Teste Sincronizada']);

        $this->assertDatabaseHas('google_business_tokens', [
            'id'             => $token->id,
            'profile_data.title' => 'Loja Teste Sincronizada',
        ]);
    }

    public function test_sincronizar_sem_token_cadastrado_retorna_404(): void
    {
        $this->autenticar();
        $this->serviceDeTeste();

        $this->withHeader('Authorization', 'Bearer token-nao-existe')
            ->get("{$this->base}/accounts/123/locations/456")
            ->assertStatus(404);
    }

    public function test_desconectar_revogar_token_e_remove_integracao(): void
    {
        $dados = $this->autenticar();
        $this->serviceDeTeste();

        $token = GoogleBusinessToken::create([
            'user_id'                   => $dados['user']->id,
            'refresh_token_encrypted'   => Crypt::encryptString('ya29.refresh-teste'),
            'scopes'                    => 'https://www.googleapis.com/auth/business.manage',
        ]);

        Http::fake([
            'oauth2.googleapis.com*' => Http::response('', 200),
        ]);

        $this->withHeader('Authorization', "Bearer {$dados['token']}")
            ->delete("{$this->base}/disconnect")
            ->assertStatus(200)
            ->assertJsonFragment(['message' => 'Integracao com o Google Business Profile removida com sucesso.']);

        $this->assertDatabaseMissing('google_business_tokens', ['id' => $token->id]);
    }
}
