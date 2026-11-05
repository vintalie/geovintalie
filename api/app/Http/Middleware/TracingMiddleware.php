<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Observability\TraceContext;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TracingMiddleware
{
    public const HEADER = 'X-Trace-ID';

    public function handle(Request $request, Closure $next): Response
    {
        $traceId = $request->headers->get(self::HEADER);

        if (! $traceId || ! Str::isUuid($traceId)) {
            $traceId = TraceContext::generate();
        } else {
            TraceContext::setId($traceId);
        }

        $response = $next($request);

        return $response->header(self::HEADER, TraceContext::id() ?? $traceId);
    }

    public function terminate(Request $request, Response $response): void
    {
        TraceContext::reset();
    }
}
