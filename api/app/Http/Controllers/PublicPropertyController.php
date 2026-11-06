<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Product;
use Illuminate\Http\Request;

class PublicPropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with('user')
            ->whereNotNull('user_id');

        if ($request->has('city')) {
            $query->whereHas('street.neighborhood.city', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->string('city') . '%');
            });
        }

        if ($request->has('state')) {
            $query->whereHas('street.neighborhood.city.state', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->string('state') . '%');
            });
        }

        if ($request->has('country')) {
            $query->whereHas('street.neighborhood.city.state.country', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->string('country') . '%');
            });
        }

        if ($request->has('lat') && $request->has('lng')) {
            $lat = $request->float('lat');
            $lng = $request->float($request->string('lng'));
            $radius = $request->float('radius') ?? 10;

            $properties = Property::with('user')
                ->whereNotNull('user_id')
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->get()
                ->filter(function ($property) use ($lat, $lng, $radius) {
                    $distance = $this->haversineDistance($lat, $lng, $property->latitude, $property->longitude);
                    return $distance <= $radius;
                })
                ->map(function ($property) use ($lat, $lng) {
                    $distance = $this->haversineDistance($lat, $lng, $property->latitude, $property->longitude);
                    return [
                        'id' => $property->id,
                        'name' => $property->name,
                        'n_property' => $property->n_property,
                        'address' => $property->street?->name ?? null,
                        'neighborhood' => $property->street?->neighborhood?->name ?? null,
                        'city' => $property->street?->neighborhood?->city?->name ?? null,
                        'state' => $property->street?->neighborhood?->city?->state?->name ?? null,
                        'country' => $property->street?->neighborhood?->city?->state?->country?->name ?? null,
                        'latitude' => (float) $property->latitude,
                        'longitude' => (float) $property->longitude,
                        'distance_km' => round($distance, 2),
                        'contact1_email' => $property->contact1_email,
                        'number1' => $property->number1,
                        'owner_name' => $property->user?->name ?? null,
                        'owner_tipo' => $property->user?->tipo_nome ?? null,
                    ];
                })->sortBy('distance_km');

            return response()->json([
                'data' => $properties->values(),
                'meta' => [
                    'center' => ['lat' => $lat, 'lng' => $lng],
                    'radius_km' => $radius,
                    'count' => $properties->count(),
                ],
            ]);
        }

        $properties = $query->paginate(20);

        return response()->json([
            'data' => $properties->items(),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
                'from' => $properties->firstItem(),
                'to' => $properties->lastItem(),
            ],
        ]);
    }

    public function show(Property $property)
    {
        $property->load('user', 'street.neighborhood.city.state.country');

        return response()->json([
            'data' => [
                'id' => $property->id,
                'name' => $property->name,
                'n_property' => $property->n_property,
                'complement' => $property->complement,
                'address' => $property->street?->name ?? null,
                'neighborhood' => $property->street?->neighborhood?->name ?? null,
                'city' => $property->street?->neighborhood?->city?->name ?? null,
                'state' => $property->street?->neighborhood?->city?->state?->name ?? null,
                'country' => $property->street?->neighborhood?->city?->state?->country?->name ?? null,
                'contact1_email' => $property->contact1_email,
                'contact2_email' => $property->contact2_email,
                'number1' => $property->number1,
                'number2' => $property->number2,
                'number3' => $property->number3,
                'latitude' => $property->latitude ? (float) $property->latitude : null,
                'longitude' => $property->longitude ? (float) $property->longitude : null,
                'owner_name' => $property->user?->name ?? null,
                'owner_tipo' => $property->user?->tipo_nome ?? null,
                'products' => $property->productStock()->where('disabled', false)->get(),
            ],
        ]);
    }

    private function haversineDistance($lat1, $lng1, $lat2, $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
