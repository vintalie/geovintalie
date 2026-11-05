<?php

declare(strict_types=1);

namespace App\Logging;

use App\Observability\CorrelationContext;
use Monolog\Logger;
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

        $record = [
            'message' => 'requerimento processado',
            'context' => [],
            'level' => Logger::INFO,
            'level_name' => 'info',
            'channel' => 'test',
            'datetime' => \DateTimeImmutable::createFromFormat('U.u', sprintf('%.6f', microtime(true))),
            'extra' => [],
        ];

        $processor = new CorrelationProcessor();
        $result = $processor($record);

        $this->assertSame('c6c1d9e2-1111-4aaa-8a11-a11111111111', $result['extra']['correlation_id']);
        $this->assertSame('Laravel', $result['extra']['service']);
        $this->assertSame('testing', $result['extra']['environment']);
    }

    public function test_correlation_id_e_nulo_quando_nao_definido(): void
    {
        CorrelationContext::reset();

        $processor = new CorrelationProcessor();
        $result = $processor(['message' => 'x', 'context' => [], 'level' => Logger::INFO, 'level_name' => 'info', 'channel' => 'test', 'datetime' => new \DateTimeImmutable(), 'extra' => []]);

        $this->assertNull($result['extra']['correlation_id']);
    }
}
