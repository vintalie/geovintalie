<?php

declare(strict_types=1);

namespace App\Http\Controllers\Observability;

use App\Http\Controllers\Controller;
use App\Observability\CorrelationContext;
use App\Observability\TraceContext;
use Illuminate\Cache\CacheManager;
use Illuminate\Database\DatabaseManager;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

class HealthController extends Controller
{
    public function __invoke(DatabaseManager $database, CacheManager $cache): JsonResponse
    {
        $checks = [];
        $healthy = true;

        $checks['database'] = $this->checkDatabase($database);
        if ($checks['database']['status'] !== 'ok') {
            $healthy = false;
        }

        $checks['cache'] = $this->checkCache($cache);
        if ($checks['cache']['status'] !== 'ok') {
            $healthy = false;
        }

        $checks['logs'] = $this->checkLogs();
        if ($checks['logs']['status'] !== 'ok') {
            $healthy = false;
        }

        $checks['external_services'] = $this->checkExternalServices();

        return response()->json([
            'status' => $healthy ? 'ok' : 'error',
            'checked_at' => Carbon::now()->toISOString(),
            'service' => config('app.name'),
            'environment' => app()->environment(),
            'correlation_id' => CorrelationContext::id(),
            'trace_id' => TraceContext::id(),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    protected function checkDatabase(DatabaseManager $database): array
    {
        try {
            $database->connection()->getPdo();

            return ['status' => 'ok'];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    protected function checkCache(CacheManager $cache): array
    {
        try {
            $key = 'health.check';
            $ttl = Carbon::now()->addMinute();

            $cache->put($key, 1, $ttl);

            return $cache->get($key) === 1
                ? ['status' => 'ok']
                : ['status' => 'error', 'message' => 'cache did not return the stored value'];
        } catch (\Throwable $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    protected function checkLogs(): array
    {
        $logDir = storage_path('logs');

        if (! is_dir($logDir) || ! is_writable($logDir)) {
            return ['status' => 'error', 'message' => 'logs directory is not writable'];
        }

        return ['status' => 'ok'];
    }

    /**
     * Serviços externos: verificados de forma não destrutiva (apenas reachability).
     * Falha aqui não derruba o status geral do health check, pois são dependências
     * externas fora do controle da aplicacao.
     */
    protected function checkExternalServices(): array
    {
        $services = [];

        $services['google_oauth'] = $this->probeExternalService(
            'google_oauth',
            config('services.google_oauth.probe_url', 'https://www.googleapis.com/oauth2/v1/certs'),
        );

        return $services;
    }

    protected function probeExternalService(string $name, string $url): array
    {
        try {
            $start = hrtime(true) / 1_000_000_000.0;

            $response = Http::timeout(3)->get($url);

            $ms = round((hrtime(true) / 1_000_000_000.0 - $start) * 1000.0, 2);

            return [
                'status' => $response->successful() ? 'ok' : 'error',
                'latency_ms' => $ms,
                'http_status' => $response->status(),
            ];
        } catch (ConnectionException $e) {
            return [
                'status' => 'error',
                'message' => 'conexao recusada ou timeout: ' . $e->getMessage(),
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }
}
