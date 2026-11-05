<?php

namespace Tests\Unit\Services;

use App\Services\GoogleBusinessService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use Tests\TestCase;

class GoogleBusinessServiceTest extends TestCase
{
    public function test_nao_esta_configurado_sem_credenciais(): void
    {
        config([
            'google_business.client_id'     => null,
            'google_business.client_secret' => null,
            'google_business.redirect_uri'  => null,
        ]);

        $this->assertFalse(GoogleBusinessService::makeFromConfig()->isConfigured());
    }

    public function test_esta_configurado_com_credenciais_de_sandbox(): void
    {
        $this->assertTrue($this->service()->isConfigured());
    }

    public function test_autorize_url_contem_parametros_oauth2(): void
    {
        $service = $this->service();
        $state = Str::random(24);
        $url = $service->authorizeUrl($state);

        $this->assertStringContainsString('https://accounts.google.com/o/oauth2/v2/auth?', $url);
        $this->assertStringContainsString('client_id=test-client-id-sandbox', $url);
        $this->assertStringContainsString('redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fv2%2Fgoogle-business%2Fcallback', $url);
        $this->assertStringContainsString('response_type=code', $url);
        $this->assertStringContainsString('scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fbusiness.manage', $url);
        $this->assertStringContainsString('access_type=offline', $url);
        $this->assertStringContainsString('prompt=consent', $url);
        $this->assertStringContainsString('state=' . $state, $url);
    }

    public function test_troca_codigo_de_autorizacao_por_tokens_com_sucesso(): void
    {
        $service = $this->service();

        Http::fake([
            'oauth2.googleapis.com*' => Http::response([
                'access_token'  => 'ya29.access-teste',
                'refresh_token' => 'ya29.refresh-teste',
                'expires_in'    => 3600,
                'token_type'    => 'Bearer',
            ], 200),
        ]);

        $tokens = $service->exchangeCode('codigo-de-autorizacao-google');

        $this->assertSame('ya29.access-teste', $tokens['access_token']);
        $this->assertSame('ya29.refresh-teste', $tokens['refresh_token']);
        $this->assertSame(3600, $tokens['expires_in']);
        $this->assertSame('Bearer', $tokens['token_type']);
    }

    public function test_troca_codigo_com_erro_do_google_lanca_excecao(): void
    {
        $service = $this->service();

        Http::fake([
            'oauth2.googleapis.com*' => Http::response('{"error":"invalid_grant"}', 400),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Falha ao trocar o codigo de autorizacao pelo token');

        $service->exchangeCode('codigo-invalido');
    }

    public function test_renova_access_token_usando_refresh_token(): void
    {
        $service = $this->service();

        Http::fake([
            'oauth2.googleapis.com*' => Http::response([
                'access_token' => 'ya29.novo-access-teste',
                'expires_in'   => 3600,
                'token_type'   => 'Bearer',
            ], 200),
        ]);

        $tokens = $service->refreshAccessToken('ya29.refresh-teste');

        $this->assertSame('ya29.novo-access-teste', $tokens['access_token']);
        $this->assertSame('Bearer', $tokens['token_type']);
    }

    public function test_lista_contas_do_google_business_profile(): void
    {
        $service = $this->service();

        Http::fake([
            'mybusinessbusinessinformation.googleapis.com/v1*' => Http::response([
                'accounts' => [
                    ['name' => 'accounts/123', 'accountName' => 'Conta Teste', 'displayName' => 'Conta Teste'],
                ],
            ], 200),
        ]);

        $contas = $service->fetchAccounts('ya29.access-teste');

        $this->assertCount(1, $contas);
        $this->assertSame('accounts/123', $contas[0]['name']);
        $this->assertSame('Conta Teste', $contas[0]['accountName']);
    }

    public function test_lista_locais_de_uma_conta(): void
    {
        $service = $this->service();

        Http::fake([
            'mybusinessbusinessinformation.googleapis.com/v1*' => Http::response([
                'locations' => [
                    ['name' => 'accounts/123/locations/456', 'title' => 'Loja Teste'],
                ],
            ], 200),
        ]);

        $locais = $service->fetchLocations('ya29.access-teste', 'accounts/123');

        $this->assertCount(1, $locais);
        $this->assertSame('Loja Teste', $locais[0]['title']);
    }

    public function test_busca_dados_de_um_local_para_sincronizacao(): void
    {
        $service = $this->service();

        Http::fake([
            'mybusinessbusinessinformation.googleapis.com/v1*' => Http::response([
                'name'  => 'accounts/123/locations/456',
                'title' => 'Loja Teste Sincronizada',
                'addresses' => [
                    [
                        'addressLines' => ['Rua dos Testes, 100'],
                        'locality'     => 'Sao Paulo',
                        'postalCode'   => '01000-000',
                    ],
                ],
                'phones' => [['value' => '+5511999999999']],
            ], 200),
        ]);

        $perfil = $service->fetchLocation('ya29.access-teste', 'accounts/123', 'locations/456');

        $this->assertSame('accounts/123/locations/456', $perfil['name']);
        $this->assertSame('Loja Teste Sincronizada', $perfil['title']);
        $this->assertArrayHasKey('addresses', $perfil);
        $this->assertArrayHasKey('phones', $perfil);
    }

    public function test_revogar_token_retorna_booleano(): void
    {
        $service = $this->service();

        Http::fake([
            'oauth2.googleapis.com*' => Http::response('', 200),
        ]);

        $this->assertTrue($service->revokeToken('ya29.refresh-teste'));
    }

    private function service(): GoogleBusinessService
    {
        return new GoogleBusinessService(
            clientId:     'test-client-id-sandbox',
            clientSecret: 'test-client-secret-sandbox',
            redirectUri:  'http://localhost:8000/api/v2/google-business/callback',
            authUri:      'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUri:     'https://oauth2.googleapis.com/token',
            baseUrl:      'https://mybusinessbusinessinformation.googleapis.com/v1',
            scopes:       ['https://www.googleapis.com/auth/business.manage'],
        );
    }
}
