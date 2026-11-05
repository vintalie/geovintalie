<?php

declare(strict_types=1);

namespace App\Logging;

use App\Observability\CorrelationContext;

final class CorrelationProcessor
{
    public function __invoke(array $record): array
    {
        $record['extra']['correlation_id'] = CorrelationContext::id();
        $record['extra']['service'] = config('app.name', 'laravel');
        $record['extra']['environment'] = app()->environment();

        return $record;
    }
}
