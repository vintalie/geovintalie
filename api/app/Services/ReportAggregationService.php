<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Property;
use App\Models\ReportDemandSignal;
use App\Models\Stock;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Servico de agregacao de dados para relatorios de inteligencia (Escopo A5).
 *
 * Produz:
 *  - pontos de oferta (estoque de produtos por propriedade/geolocalizacao)
 *  - pontos de demanda (sinais de demanda por categoria/localizacao)
 *  - celulas de mapa de calor oferta x demanda (pontuacao e intensidade)
 *  - resumo executivo com totais e saldo
 */
class ReportAggregationService
{
    public function summary(array $filters = []): array
    {
        $supply = $this->supply($filters);
        $demand = $this->demand($filters);

        $totalSupply = array_reduce($supply, fn ($carry, $p) => $carry + (int) $p['quantity'], 0);
        $totalDemand = array_reduce($demand, fn ($carry, $p) => $carry + (int) $p['weight'], 0);

        $categories = array_merge(
            array_column($supply, 'category'),
            array_column($demand, 'category')
        );
        $categories = array_values(array_unique(array_filter($categories)));

        return [
            'total_supply' => $totalSupply,
            'total_demand' => $totalDemand,
            'balance' => $totalSupply - $totalDemand,
            'coverage_areas' => count($this->heatmap($filters)),
            'categories' => array_map(fn ($c) => ['category' => $c], $categories),
            'generated_at' => now()->toISOString(),
        ];
    }

    public function supply(array $filters = []): array
    {
        $products = Product::with(['stocks', 'property'])->get();

        return $products->map(function ($product) use ($filters) {
            if (! $this->matchesFilters($product, $filters)) {
                return null;
            }

            $property = $product->property;
            $quantity = (int) $product->stocks->sum('quantity');

            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'category' => $product->tipo ?? null,
                'price' => $product->price ?? null,
                'quantity' => $quantity,
                'property_id' => $property?->id,
                'property_name' => $property?->name,
                'city' => $property?->city ?? null,
                'state' => $property?->state ?? null,
                'latitude' => $property?->latitude ? (float) $property->latitude : null,
                'longitude' => $property?->longitude ? (float) $property->longitude : null,
            ];
        })->filter()->values()->all();
    }

    public function demand(array $filters = []): array
    {
        $query = ReportDemandSignal::query();

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        if (! empty($filters['city'])) {
            $query->where('city', $filters['city']);
        }
        if (! empty($filters['state'])) {
            $query->where('state', $filters['state']);
        }
        if (! empty($filters['date_from'])) {
            $query->where('recorded_at', '>=', Carbon::parse($filters['date_from']));
        }
        if (! empty($filters['date_to'])) {
            $query->where('recorded_at', '<=', Carbon::parse($filters['date_to']));
        }

        return $query->with('property')->get()->map(function ($signal) {
            return [
                'id' => $signal->id,
                'category' => $signal->category,
                'signal_type' => $signal->signal_type,
                'weight' => (int) $signal->weight,
                'property_id' => $signal->property_id,
                'property_name' => $signal->property?->name,
                'city' => $signal->city,
                'state' => $signal->state,
                'latitude' => $signal->latitude ? (float) $signal->latitude : null,
                'longitude' => $signal->longitude ? (float) $signal->longitude : null,
                'recorded_at' => $signal->recorded_at?->toISOString(),
            ];
        })->all();
    }

    /**
     * Celulas do mapa de calor: agrupamento geografico (bucket de coordenadas)
     * com oferta, demanda, pontuacao (demanda - oferta) e intensidade.
     */
    public function heatmap(array $filters = []): array
    {
        $precision = 2; // ~1km por celula em coordenadas decimais
        $cells = [];

        $add = function (array &$cells, float $lat, float $lng, string $type, int $value) use (&$precision) {
            $key = round($lat, $precision) . ',' . round($lng, $precision);
            if (! isset($cells[$key])) {
                $cells[$key] = [
                    'lat' => round($lat, $precision),
                    'lng' => round($lng, $precision),
                    'supply' => 0,
                    'demand' => 0,
                    'supply_points' => 0,
                    'demand_points' => 0,
                ];
            }
            if ($type === 'supply') {
                $cells[$key]['supply'] += $value;
                $cells[$key]['supply_points'] += 1;
            } else {
                $cells[$key]['demand'] += $value;
                $cells[$key]['demand_points'] += 1;
            }
        };

        foreach ($this->supply($filters) as $point) {
            if ($point['latitude'] !== null && $point['longitude'] !== null) {
                $add($cells, $point['latitude'], $point['longitude'], 'supply', (int) $point['quantity']);
            }
        }

        foreach ($this->demand($filters) as $point) {
            if ($point['latitude'] !== null && $point['longitude'] !== null) {
                $add($cells, $point['latitude'], $point['longitude'], 'demand', (int) $point['weight']);
            }
        }

        return array_values(array_map(function ($cell) {
            $score = $cell['demand'] - $cell['supply'];
            return [
                'lat' => $cell['lat'],
                'lng' => $cell['lng'],
                'supply' => $cell['supply'],
                'demand' => $cell['demand'],
                'score' => $score,
                'balance' => $cell['supply'] - $cell['demand'],
                'intensity' => $this->intensity($score),
                'supply_points' => $cell['supply_points'],
                'demand_points' => $cell['demand_points'],
            ];
        }, $cells));
    }

    public function export(array $filters = []): string
    {
        $lines = ['category,signal_type,weight,property_id,property_name,city,state,latitude,longitude,recorded_at'];
        foreach ($this->demand($filters) as $row) {
            $lines[] = implode(',', array_map(fn ($v) => Str::of((string) $v)->replace(',', ' ')->__toString(), [
                $row['category'],
                $row['signal_type'],
                $row['weight'],
                $row['property_id'],
                $row['property_name'],
                $row['city'],
                $row['state'],
                $row['latitude'],
                $row['longitude'],
                $row['recorded_at'],
            ]));
        }

        return implode("\n", $lines) . "\n";
    }

    private function intensity(int $score): string
    {
        $abs = abs($score);
        if ($abs <= 0) {
            return 'baixo';
        }
        if ($abs <= 5) {
            return 'medio';
        }
        if ($abs <= 15) {
            return 'alto';
        }
        return 'critico';
    }

    private function matchesFilters($product, array $filters): bool
    {
        if (! empty($filters['category']) && strcasecmp($product->tipo ?? '', $filters['category']) !== 0) {
            return false;
        }
        if (! empty($filters['date_from']) && $product->created_at?->lt(Carbon::parse($filters['date_from']))) {
            return false;
        }
        if (! empty($filters['date_to']) && $product->created_at?->gt(Carbon::parse($filters['date_to']))) {
            return false;
        }
        return true;
    }
}
