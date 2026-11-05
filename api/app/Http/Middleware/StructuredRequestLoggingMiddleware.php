<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Observability\CorrelationContext;
use App\Observability\TraceContext;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class StructuredRequestLoggingMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = hrtime(true) / 1_000_000_000.0;

        $response = $next($request);

        $ms = (hrtime(true) / 1_000_000_000.0 - $start) * 1000.0;
        $route = $request->route();

        Log::channel('json')->info('http.request_handled', [
            'correlation_id' => CorrelationContext::id(),
            'trace_id' => TraceContext::id(),
            'method' => $request->method(),
            'path' => $request->path(),
            'route' => $route ? $route->uri() : $request->path(),
            'status_code' => $response->getStatusCode(),
            'latency_ms' => round($ms, 2),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user() ? $request->user()->getAuthIdentifier() : null,
        ]);

        return $response;
    }
}
