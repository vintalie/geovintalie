<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Observability\MetricsRegistry;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class MetricsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = hr_time(true);
        $endpoint = $this->endpoint($request);
        $status = 500;

        try {
            $response = $next($request);
            $status = $response->getStatusCode();

            return $response;
        } catch (\Throwable $e) {
            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

            MetricsRegistry::instance()->recordError($endpoint, $status);

            throw $e;
        } finally {
            $ms = (hr_time(true) - $start) * 1000.0;
            MetricsRegistry::instance()->recordRequest($endpoint, $status, $ms);
        }
    }

    private function endpoint(Request $request): string
    {
        $route = $request->route();

        if ($route) {
            $uri = $route->uri();

            if ($uri !== '') {
                return $uri;
            }

            return $route->action['as'] ?? $route->getName() ?? 'unknown';
        }

        return $request->path();
    }
}
