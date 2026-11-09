<?php

namespace App\Http\Controllers;

use App\Services\ReportAggregationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    public function __construct(
        protected ReportAggregationService $reports,
    ) {
    }

    public function summary(Request $request)
    {
        return response()->json([
            'data' => $this->reports->summary($request->only(['category', 'city', 'state', 'date_from', 'date_to'])),
        ]);
    }

    public function supply(Request $request)
    {
        return response()->json([
            'data' => $this->reports->supply($request->only(['category', 'city', 'state', 'date_from', 'date_to'])),
            'meta' => ['count' => count($this->reports->supply($request->only(['category', 'city', 'state', 'date_from', 'date_to'])))],
        ]);
    }

    public function demand(Request $request)
    {
        return response()->json([
            'data' => $this->reports->demand($request->only(['category', 'city', 'state', 'date_from', 'date_to'])),
            'meta' => ['count' => count($this->reports->demand($request->only(['category', 'city', 'state', 'date_from', 'date_to'])))],
        ]);
    }

    public function heatmap(Request $request)
    {
        return response()->json([
            'data' => $this->reports->heatmap($request->only(['category', 'city', 'state', 'date_from', 'date_to'])),
            'meta' => [
                'count' => count($this->reports->heatmap($request->only(['category', 'city', 'state', 'date_from', 'date_to']))),
                'precision' => '~1km por celula (bucket de coordenadas)',
            ],
        ]);
    }

    public function export(Request $request)
    {
        $csv = $this->reports->export($request->only(['category', 'city', 'state', 'date_from', 'date_to']));

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="relatorio-demanda.csv"',
        ]);
    }
}
