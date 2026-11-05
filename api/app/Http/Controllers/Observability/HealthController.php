<?php

declare(strict_types=1);

namespace App\Http\Controllers\Observability;

use App\Http\Controllers\Controller;
use App\Observability\CorrelationContext;
use Illuminate\Cache\CacheManager;
use Illuminate\Database\DatabaseManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class HealthController extends Controller
{
    public function __invoke(DatabaseManager $database, CacheManager $cache): JsonResponse
    {
        $checks = [];
        $healthy = true;

        try {
            $database->connection()->getPdo();

            $checks['database'] = ['status' => 'ok'];
        } catch (\Throwable $e) {
            $checks['database'] = [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
            $healthy = false;
        }

        try {
            $key = 'health.check';
            $ttl = Carbon::now()->addMinute();

            $cache->put($key, 1, $ttl);
            $checks['cache'] = $cache->get($key) === 1
                ? ['status' => 'ok']
                : ['status' => 'error', 'message' => 'cache did not return the stored value'];
        } catch (\Throwable $e) {
            $checks['cache'] = ['status' => 'error', 'message' => $e->getMessage()];
            $healthy = false;
        }

        $logDir = storage_path('logs');
        $checks['logs'] = is_dir($logDir) && is_writable($logDir)
            ? ['status' => 'ok']
            : ['status' => 'error', 'message' => 'logs directory is not writable'];

        if (! is_dir($logDir) || ! is_writable($logDir)) {
            $healthy = false;
        }

        return response()->json([
            'status' => $healthy ? 'ok' : 'error',
            'checked_at' => Carbon::now()->toISOString(),
            'service' => config('app.name'),
            'environment' => app()->environment(),
            'correlation_id' => CorrelationContext::id(),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }
}
