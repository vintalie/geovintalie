<?php

declare(strict_types=1);

namespace App\Logging;

use App\Observability\CorrelationContext;
use Monolog\Level;
use Monolog\LogRecord;
use Tests\TestCase;

class CorrelationProcessorTest extends TestCase
{
    protected function tearDown(): void
    {
        CorrelationContext::reset();

        parent::tearDown();
    }

    public function test_injeta_correlation_id_no_extra_do_registro(): void
    {
        CorrelationContext::setId('c6c1d9e2-1111-4aaa-8a11-a11111111111');

        $record = new LogRecord(
            datetime: \DateTimeImmutable::createFromFormat('U.u', sprintf('%.6f', microtime(true))),
            channel: 'test',
            level: Level::Info,
            message: 'requerimento processado',
            context: [],
            extra: [],
        );

        $processor = new CorrelationProcessor();
        $result = $processor($record);

        $this->assertSame('c6c1d9e2-1111-4aaa-8a11-a11111111111', $result->extra['correlation_id']);
        $this->assertSame('Laravel', $result->extra['service']);
        $this->assertSame('testing', $result->extra['environment']);
    }

    public function test_correlation_id_e_nulo_quando_nao_definido(): void
    {
        CorrelationContext::reset();

        $processor = new CorrelationProcessor();
        $result = $processor(new LogRecord(
            datetime: new \DateTimeImmutable(),
            channel: 'test',
            level: Level::Info,
            message: 'x',
            context: [],
            extra: [],
        ));

        $this->assertNull($result->extra['correlation_id']);
    }
}
