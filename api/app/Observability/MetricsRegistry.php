<?php

declare(strict_types=1);

namespace App\Observability;

final class MetricsRegistry
{
    private static self $instance;

    /** @var array<string, int> */
    private array $requestsByEndpoint = [];

    /** @var array<string, int> */
    private array $requestsByStatus = [];

    /** @var array<string, int> */
    private array $errorsByEndpoint = [];

    /** @var array<string, int> */
    private array $errorsByStatus = [];

    /** @var array<string, array{count: int, sum_ms: float, buckets: array<string, int>}> */
    private array $latencyByEndpoint = [];

    private const BUCKETS_MS = [5, 50, 100, 250, 500, 1000, 2000];

    private int $totalRequests = 0;

    private int $totalErrors = 0;

    private function __construct()
    {
    }

    public static function instance(): self
    {
        if (! isset(self::$instance)) {
            $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
            $caller = ($trace[0]['class'] ?? '?') . '::' . ($trace[0]['function'] ?? '?');
            error_log('[METRICS-PROBE] NEW MetricsRegistry instance pid=' . getmypid() . ' created by ' . $caller . "\n", 3, '/tmp/metrics_probe.log');
            self::$instance = new self();
        }

        return self::$instance;
    }

    public static function reset(): void
    {
        self::$instance = new self();
    }

    public function recordRequest(string $endpoint, int $status, float $ms): void
    {
        error_log('[METRICS-PROBE] recordRequest ' . $endpoint . ' ' . $status . ' instance=' . spl_object_id($this) . "\n", 3, '/tmp/metrics_probe.log');
        $this->totalRequests++;
        $this->requestsByEndpoint[$endpoint] = ($this->requestsByEndpoint[$endpoint] ?? 0) + 1;
        $this->requestsByStatus["status:{$status}"] = ($this->requestsByStatus["status:{$status}"] ?? 0) + 1;

        $bucket = $this->bucket($ms);
        $entry = &$this->latencyByEndpoint[$endpoint];
        $entry['count'] = ($entry['count'] ?? 0) + 1;
        $entry['sum_ms'] = round(($entry['sum_ms'] ?? 0.0) + $ms, 4);
        $entry['buckets'][$bucket] = ($entry['buckets'][$bucket] ?? 0) + 1;
    }

    public function recordError(string $endpoint, int $status): void
    {
        $this->totalErrors++;
        $this->errorsByEndpoint[$endpoint] = ($this->errorsByEndpoint[$endpoint] ?? 0) + 1;
        $this->errorsByStatus["status:{$status}"] = ($this->errorsByStatus["status:{$status}"] ?? 0) + 1;
    }

    /** @return array<string, mixed> */
    public function snapshot(): array
    {
        $latency = [];
        foreach ($this->latencyByEndpoint as $endpoint => $data) {
            $count = $data['count'] ?? 0;
            $latency[$endpoint] = [
                'count' => $count,
                'avg_ms' => $count ? round($data['sum_ms'] / $count, 2) : 0.0,
                'sum_ms' => $data['sum_ms'] ?? 0.0,
                'buckets' => $data['buckets'] ?? [],
            ];
        }

        return [
            'requests' => [
                'total' => $this->totalRequests,
                'by_endpoint' => $this->requestsByEndpoint,
                'by_status' => $this->requestsByStatus,
            ],
            'errors' => [
                'total' => $this->totalErrors,
                'by_endpoint' => $this->errorsByEndpoint,
                'by_status' => $this->errorsByStatus,
            ],
            'latency' => [
                'by_endpoint' => $latency,
            ],
        ];
    }

    private function bucket(float $ms): string
    {
        foreach (self::BUCKETS_MS as $limit) {
            if ($ms < $limit) {
                return "<{$limit}ms";
            }
        }

        return '>2000ms';
    }
}
