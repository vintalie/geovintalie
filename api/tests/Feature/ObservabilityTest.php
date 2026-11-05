<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserType;
use App\Observability\CorrelationContext;
use App\Observability\MetricsRegistry;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Tests\TestCase;

class ObservabilityTest extends TestCase
{
    private string $base = '/api';

    protected function setUp(): void
    {
        parent::setUp();
        CorrelationContext::reset();
        MetricsRegistry::reset();
    }

    /** Health check --------------------------------------------------------- */

    public function test_health_endpoint_retorna_status_ok_com_checks(): void
    {
        $response = $this->get("{$this->base}/health");

        $response->assertStatus(200);
        $response->assertJsonFragment(['status' => 'ok']);
        $response->assertJsonStructure([
            'status',
            'checked_at',
            'service',
            'environment',
            'correlation_id',
            'checks' => [
                'database' => ['status'],
                'cache' => ['status'],
                'logs' => ['status'],
            ],
        ]);
        $this->assertSame('ok', $response->json('checks.database.status'));
        $this->assertSame('ok', $response->json('checks.cache.status'));
        $this->assertNotNull($response->json('correlation_id'));
    }

    /** Metrics -------------------------------------------------------------- */

    public function test_metrics_endpoint_retorna_estrutura_esperada(): void
    {
        $response = $this->get("{$this->base}/metrics");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'service',
            'environment',
            'checked_at',
            'metrics' => [
                'requests' => ['total', 'by_endpoint', 'by_status'],
                'errors' => ['total', 'by_endpoint', 'by_status'],
                'latency' => ['by_endpoint'],
            ],
        ]);
    }

    public function test_metrics_contabilizam_requisicao_erro_e_latencia(): void
    {
        $this->get("{$this->base}/health")->assertStatus(200);

        // Endpoint inexistente gera erro 404, contabilizado como erro.
        $this->get("{$this->base}/nao-existe")->assertStatus(404);

        $metrics = $this->get("{$this->base}/metrics")->json('metrics');

        $this->assertGreaterThanOrEqual(1, $metrics['requests']['total']);
        $this->assertArrayHasKey('api/health', $metrics['requests']['by_endpoint']);
        $this->assertArrayHasKey('status:404', $metrics['errors']['by_status']);
        $this->assertGreaterThanOrEqual(1, $metrics['errors']['total']);
        $this->assertArrayHasKey('api/health', $metrics['latency']['by_endpoint']);
        $this->assertArrayHasKey('count', $metrics['latency']['by_endpoint']['api/health']);
        $this->assertArrayHasKey('avg_ms', $metrics['latency']['by_endpoint']['api/health']);
        $this->assertArrayHasKey('buckets', $metrics['latency']['by_endpoint']['api/health']);
    }

    /** Correlation ID ------------------------------------------------------- */

    public function test_correlation_id_e_gerado_quando_ausente_e_retornado_no_header(): void
    {
        $response = $this->post("{$this->base}/login", [
            'email' => 'nao@existe.com',
            'password' => 'senha',
        ]);

        $response->assertStatus(422);
        $header = $response->headers->get('X-Correlation-ID');

        $this->assertNotNull($header);
        $this->assertTrue(Str::isUuid($header));
    }

    public function test_correlation_id_fornecido_echoado_no_header(): void
    {
        $id = Str::uuid()->toString();

        $response = $this->withHeader('X-Correlation-ID', $id)
            ->get("{$this->base}/health");

        $response->assertStatus(200);
        $this->assertSame($id, $response->headers->get('X-Correlation-ID'));
        $this->assertSame($id, $response->json('correlation_id'));
    }

    public function test_rota_desconhecida_tambem_recebe_correlation_id(): void
    {
        $response = $this->get("{$this->base}/qualquer-coisa");

        $response->assertStatus(404);
        $this->assertTrue(Str::isUuid($response->headers->get('X-Correlation-ID')));
    }

    /** Logs estruturados ---------------------------------------------------- */

    public function test_log_estruturado_em_json_contem_correlation_id(): void
    {
        $correlationId = Str::uuid()->toString();
        CorrelationContext::setId($correlationId);

        Log::info('observabilidade.teste', ['chave' => 'valor']);

        $logFile = storage_path('logs/laravel.log');
        $lines = array_filter(file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
        $last = json_decode(end($lines), true);

        $this->assertIsArray($last);
        $this->assertSame('observabilidade.teste', $last['message']);
        $this->assertSame('valor', $last['context']['chave'] ?? null);
        $this->assertSame($correlationId, $last['extra']['correlation_id'] ?? null);
    }

    /** Helpers -------------------------------------------------------------- */

    private function token(string $tipoNome): string
    {
        $tipo = UserType::firstOrCreate(['nome' => $tipoNome], ['nome' => $tipoNome]);
        $email = "{$tipoNome}@teste.com";
        User::factory()->create(['email' => $email, 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);

        $login = $this->post("{$this->base}/login", ['email' => $email, 'password' => 'senha123']);

        return $login->json('token');
    }
}
