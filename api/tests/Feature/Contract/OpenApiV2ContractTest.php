<?php

namespace Tests\Feature\Contract;

use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\Yaml\Yaml;
use Tests\TestCase;

/**
 * Testes de contrato contra a especificacao OpenAPI v2.
 *
 * Valida que a API implementada em api/routes/api.php honra o contrato
 * aprovado em .hermes/architecture/openapi/v2-openapi.yaml:
 *  - o documento OpenAPI e valido e autoconsistente;
 *  - endpoints publicos retornam os status codes declarados no contrato;
 *  - endpoints protegidos exigem bearerAuth (401 sem token);
 *  - endpoints autenticados retornam 200 com a estrutura de recurso esperada;
 *  - cobertura de rotas: cada caminho do contrato existe nas rotas v2 e vice-versa.
 */
class OpenApiV2ContractTest extends TestCase
{
    use RefreshDatabase;

    private const SPEC_PATH = '/home/mario/Documentos/geovintalie/.hermes/architecture/openapi/v2-openapi.yaml';

    /** @var array<string, mixed> */
    private array $spec = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->spec = Yaml::parseFile(self::SPEC_PATH);
    }

    /* Contrato ----------------------------------------------------------------- */

    public function test_especificacao_openapi_v2_estah_valida_e_autoconsistente(): void
    {
        $this->assertSame('3.0.3', $this->spec['openapi']);
        $this->assertStringContainsString('GeoVintalie', $this->spec['info']['title'] ?? '');
        $this->assertNotEmpty($this->spec['paths']);
        $this->assertArrayHasKey('components', $this->spec);
        $this->assertArrayHasKey('schemas', $this->spec['components']);

        foreach ($this->spec['paths'] as $path => $pathItem) {
            $this->assertIsArray($pathItem, "O caminho {$path} deve ser um path item");
            $operacoes = array_filter(
                $pathItem,
                fn ($item, $verbo) => is_array($item) && isset($item['responses']),
                ARRAY_FILTER_USE_BOTH
            );
            $this->assertNotEmpty($operacoes, "O caminho {$path} nao tem operacoes com responses definidas");
            foreach ($operacoes as $operacao) {
                $this->assertArrayHasKey('responses', $operacao);
                $this->assertNotEmpty($operacao['responses'], "Operacao em {$path} nao declara responses");
            }
        }
    }

    public function test_endpoints_publicos_retornam_status_de_contrato(): void
    {
        foreach (self::publicoProvider() as $caso) {
            [$method, $path, $expectedStatus] = $caso;
            $response = $this->fazerRequisicao($method, "/api{$path}");
            $declarados = $this->statusesDoContrato($path, strtolower($method));
            $this->assertContains(
                $expectedStatus,
                $declarados,
                "{$method} {$path}: o contrato nao declara o status {$expectedStatus} (declarados: " . implode(',', $declarados) . ")"
            );
            $this->assertSame(
                $expectedStatus,
                $response->status(),
                "{$method} {$path} deveria retornar {$expectedStatus} segundo o contrato; obteve {$response->status()}"
            );
        }
    }

    public static function publicoProvider(): array
    {
        return [
            ['GET', '/v2/health', 200],
            ['GET', '/v2/metrics', 200],
            ['GET', '/v2/service-categories', 200],
            ['GET', '/v2/service-search', 200],
            ['GET', '/v2/public/properties', 200],
            ['GET', '/v2/google-business/callback', 422],
        ];
    }

    public function test_endpoints_protegidos_sem_token_retornam_401(): void
    {
        foreach (self::protegidoProvider() as $caso) {
            [$method, $path, $body] = $caso;
            $response = $this->fazerRequisicao($method, "/api{$path}", $body);
            $this->assertSame(
                401,
                $response->status(),
                "{$method} {$path} sem token deveria retornar 401 (contrato exige bearerAuth); obteve {$response->status()}"
            );
        }
    }

    public static function protegidoProvider(): array
    {
        return [
            ['GET', '/v2/auth/me', []],
            ['GET', '/v2/auth/users', []],
            ['GET', '/v2/service-providers', []],
            ['GET', '/v2/feature-flags', []],
            ['POST', '/v2/service-providers', []],
            ['PUT', '/v2/service-providers/1', ['business_name' => 'X']],
            ['GET', '/v2/product-locator', []],
            ['POST', '/v2/service-evaluations', []],
            ['GET', '/v2/appointments', []],
            ['POST', '/v2/appointments', []],
            ['GET', '/v2/conversations', []],
            ['POST', '/v2/conversations', ['participant_two_id' => 1]],
            ['GET', '/v2/user-consents', []],
            ['POST', '/v2/user-consents', []],
        ];
    }

    /* Autenticado -------------------------------------------------------------- */

    public function test_autenticado_obtem_dados_proprios_com_estrutura_de_usuario(): void
    {
        $token = $this->criarTokenUsuario();
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get('/api/v2/auth/me');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/json');
        $response->assertJsonStructure(['message', 'user' => ['id', 'name', 'email', 'tipo_nome']]);
        $this->assertNotNull($response->json('user.id'));
        $this->assertNotNull($response->json('user.email'));
    }

    public function test_autenticado_lista_service_providers_com_estrutura_de_contrato(): void
    {
        $token = $this->criarTokenUsuario();
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get('/api/v2/service-providers');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => [], 'meta']);
        $this->assertIsArray($response->json('data'));
    }

    public function test_criar_service_provider_sem_body_retorna_422_contrato(): void
    {
        $token = $this->criarTokenUsuario();
        $this->withHeader('Authorization', "Bearer {$token}")
            ->post('/api/v2/service-providers', [])
            ->assertStatus(422);
    }

    public function test_health_retorna_campos_do_schema_health(): void
    {
        $response = $this->get('/api/v2/health');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'checked_at',
            'service',
            'environment',
            'correlation_id',
            'trace_id',
            'checks' => ['database', 'cache', 'logs', 'external_services'],
        ]);
    }

    /* Cobertura de rotas: contrato vs. implementacao --------------------------- */

    public function test_caminhos_do_contrato_existem_nas_rotas_v2(): void
    {
        $rotasV2 = $this->urisDasRotasV2();
        foreach (array_keys($this->spec['paths']) as $caminhoContrato) {
            $normalizado = $this->normalizarCaminho(ltrim($caminhoContrato, '/'));
            $this->assertContains(
                $normalizado,
                $rotasV2,
                "Contrato declara caminho {$caminhoContrato} mas nenhuma rota v2 o implementa"
            );
        }
    }

    public function test_rotas_v2_estao_documentadas_no_contrato(): void
    {
        $caminhosContrato = array_map(
            fn ($c) => $this->normalizarCaminho(ltrim($c, '/')),
            array_keys($this->spec['paths'])
        );
        foreach ($this->urisDasRotasV2() as $uri) {
            $this->assertContains(
                $uri,
                $caminhosContrato,
                "Rota v2 implementada ({$uri}) nao esta documentada no contrato OpenAPI v2"
            );
        }
    }

    /* Helpers ------------------------------------------------------------------ */

    private function criarTokenUsuario(): string
    {
        $tipo = UserType::firstOrCreate(['nome' => 'user'], ['nome' => 'user']);
        $user = User::factory()->create([
            'email' => 'contrato@teste.com',
            'password' => bcrypt('senha123'),
            'tipo_id' => $tipo->id,
        ]);
        return JWTAuth::fromUser($user);
    }

    /**
     * @return array<int, string> URIs normalizadas (ex: health, auth/me) das rotas registradas sob o prefixo v2.
     */
    private function urisDasRotasV2(): array
    {
        $uris = [];
        foreach (Route::getRoutes() as $route) {
            $uri = $route->uri();
            if ($uri === 'api/v2' || str_starts_with($uri, 'api/v2/')) {
                $uris[] = $this->normalizarCaminho(str_replace('api/v2/', '', $uri));
            }
        }
        return array_values(array_unique($uris));
    }

    /**
     * Normaliza um caminho de comparacao: substitui {parametro} por {}
     * para comparar rotas Laravel com o contrato OpenAPI.
     */
    private function normalizarCaminho(string $caminho): string
    {
        return preg_replace('/\{[^}]+\}/', '{}', trim($caminho, '/'));
    }

    /**
     * @return array<int, string>
     */
    private function statusesDoContrato(string $caminho, string $method): array
    {
        $caminho = ltrim($caminho, '/');
        // Os paths do spec sao relativos ao servidor /api/v2 (ex: /health)
        if (str_starts_with($caminho, 'v2/')) {
            $caminho = substr($caminho, 3);
        }
        $caminho = '/' . ltrim($caminho, '/');
        if (!isset($this->spec['paths'][$caminho]) || !isset($this->spec['paths'][$caminho][$method])) {
            return [];
        }
        return array_keys((array) $this->spec['paths'][$caminho][$method]['responses']);
    }

    private function fazerRequisicao(string $method, string $uri, array $body = [])
    {
        return match ($method) {
            'GET'    => $this->get($uri),
            'POST'   => $this->post($uri, $body),
            'PUT'    => $this->put($uri, $body),
            'PATCH'  => $this->patch($uri, $body),
            'DELETE' => $this->delete($uri),
            default  => $this->get($uri),
        };
    }
}
