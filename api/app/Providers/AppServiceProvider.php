<?php

namespace App\Providers;

use App\Logging\CorrelationProcessor;
use App\Services\GoogleBusinessService;
use Illuminate\Log\LogManager;
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
        $this->app->when(LogManager::class)
            ->needs('$config')
            ->give(function () {
                return config('logging');
            });

        $manager = app(LogManager::class);
        $manager->channel('json'); // força inicialização do canal

        $manager->getChannel('json'); // garante que existe

        // Injetar o processador no logger monolog subjacente do canal json
        $log = app('log');
        $channel = $log->channel('json');
        $reflection = new \ReflectionClass($channel);
        $loggerProperty = $reflection->getProperty('logger');
        $loggerProperty->setAccessible(true);
        $monologLogger = $loggerProperty->getValue($channel);
        $monologLogger->pushProcessor(new CorrelationProcessor());
    }
}
