<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Observability\MetricsRegistry;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de métricas de negócio: registra para cada requisição o
 * volume (requests), erros (status >= 400) e latência por endpoint
 * (método + URI), expostos posteriormente pelo endpoint de métricas.
 */
class CollectMetricsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = hrtime(true);

        try {
            $response = $next($request);
            $status = $response->getStatusCode();
        } catch (\Throwable $e) {
            $status = 500;
            throw $e;
        } finally {
            $latencyMs = (hrtime(true) - $start) / 1_000_000;

            MetricsRegistry::instance()->recordRequest(
                $request->route()?->uri ?? $request->path(),
                $status,
                $latencyMs
            );

            if ($status >= 400) {
                MetricsRegistry::instance()->recordError(
                    $request->route()?->uri ?? $request->path(),
                    $status
                );
            }
        }

        return $response;
    }
}
