<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CheckFeatureFlag;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\CorrelationIdMiddleware;
use App\Http\Middleware\MetricsMiddleware;
use App\Http\Middleware\StructuredRequestLoggingMiddleware;
use App\Http\Middleware\TracingMiddleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role'       => CheckRole::class,
            'feature.flag' => CheckFeatureFlag::class,
        ]);

        $middleware->append([
            CorrelationIdMiddleware::class,
            MetricsMiddleware::class,
            TracingMiddleware::class,
            StructuredRequestLoggingMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
