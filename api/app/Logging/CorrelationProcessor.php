<?php

declare(strict_types=1);

namespace App\Logging;

use App\Observability\CorrelationContext;
use Monolog\Level;
use Monolog\LogRecord;

final class CorrelationProcessor
{
    public function __invoke(LogRecord $record): LogRecord
    {
        $record->extra['correlation_id'] = CorrelationContext::id();
        $record->extra['service'] = config('app.name', 'laravel');
        $record->extra['environment'] = app()->environment();

        return $record;
    }
}
