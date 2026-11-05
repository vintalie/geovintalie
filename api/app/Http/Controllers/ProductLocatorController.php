<?php

namespace App\Http\Controllers;

use App\Models\FeatureFlag;
use App\Models\ProductGeoIndex;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductLocatorController extends Controller
{
    public function index(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_o2o_locator')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'sometimes|numeric|min:0.1|max:100',
            'product_name' => 'sometimes|string|max:255',
            'limit' => 'sometimes|integer|min:1|max:100',
        ]);

        $lat = $request->float('lat');
        $lng = $request->float('lng');
        $radius = $request->float('radius') ?? 10;
        $limit = $request->integer('limit') ?? 20;

        $query = ProductGeoIndex::with('product', 'property')
            ->where('stock_quantity', '>', 0);

        if ($request->has('product_name')) {
            $query->whereHas('product', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->product_name . '%');
            });
        }

        $results = $query->get()->map(function ($geo) use ($lat, $lng, $radius) {
            $distance = $this->haversineDistance($lat, $lng, $geo->latitude, $geo->longitude);
            if ($distance > $radius) {
                return null;
            }
            return [
                'id' => $geo->id,
                'product_id' => $geo->product_id,
                'property_id' => $geo->property_id,
                'property_name' => $geo->property->name ?? null,
                'product_name' => $geo->product->name ?? null,
                'price' => $geo->product->price ?? null,
                'stock_quantity' => $geo->stock_quantity,
                'latitude' => $geo->latitude,
                'longitude' => $geo->longitude,
                'distance_km' => round($distance, 2),
            ];
        })->filter()->sortBy('distance_km')->take($request->integer('limit') ?? 20);

        return response()->json([
            'data' => $results->values(),
            'meta' => [
                'center' => ['lat' => $lat, 'lng' => $lng],
                'radius_km' => $radius,
                'count' => $results->count(),
            ],
        ]);
    }

    private function haversineDistance($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
