<?php

namespace App\Providers;

use App\Logging\CorrelationProcessor;
use App\Services\GoogleBusinessService;
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
    }
}
