<?php

namespace App\Providers;

use App\Logging\CorrelationProcessor;
use App\Observability\TraceContext;
use App\Services\GoogleBusinessService;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(GoogleBusinessService::class, function () {
            return GoogleBusinessService::makeFromConfig();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registra o CorrelationProcessor no canal de logs 'json' para
        // garantir que correlation_id seja injetado em registros estruturados.
        $log = app('log');
        $channel = $log->channel('json');
        $reflection = new \ReflectionClass($channel);
        $loggerProperty = $reflection->getProperty('logger');
        $loggerProperty->setAccessible(true);
        $monologLogger = $loggerProperty->getValue($channel);
        $monologLogger->pushProcessor(new CorrelationProcessor());

        // Propagacao de trace ID nas chamadas de saida (client HTTP).
        // Servicos podem encadear ->tracePropagation() para enviar X-Trace-ID
        // para dependencias externas (ex: Google Business Profile).
        PendingRequest::macro('tracePropagation', function () {
            $request = $this;

            foreach (TraceContext::headers() as $name => $value) {
                $request = $request->withHeader($name, $value);
            }

            return $request;
        });
    }
}
