<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Observability\CorrelationContext;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CorrelationIdMiddleware
{
    public const HEADER = 'X-Correlation-ID';

    public function handle(Request $request, Closure $next): Response
    {
        $id = $request->headers->get(self::HEADER);

        if (! $id || ! Str::isUuid($id)) {
            $id = Str::uuid()->toString();
        }

        CorrelationContext::setId($id);

        $response = $next($request);

        return $response->header(self::HEADER, $id);
    }

    public function terminate(Request $request, Response $response): void
    {
        CorrelationContext::reset();
    }
}
