<?php

declare(strict_types=1);

namespace App\Http\Controllers\Observability;

use App\Http\Controllers\Controller;
use App\Observability\MetricsRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class MetricsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $registry = MetricsRegistry::instance();
        error_log('[METRICS-PROBE] controller instance=' . spl_object_id($registry) . ' total=' . $registry->snapshot()['requests']['total'] . "\n", 3, '/tmp/metrics_probe.log');

        return response()->json([
            'service' => config('app.name'),
            'environment' => app()->environment(),
            'checked_at' => Carbon::now()->toISOString(),
            'metrics' => MetricsRegistry::instance()->snapshot(),
        ]);
    }
}
