<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceListingResource;
use App\Models\FeatureFlag;
use App\Models\ServiceListing;
use Illuminate\Http\Request;

class ServiceListingController extends Controller
{
    public function index(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_service_listings')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $query = ServiceListing::with('provider.user', 'category');

        if ($request->has('provider_id')) {
            $query->where('provider_id', $request->integer('provider_id'));
        }
        if ($request->has('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        } else {
            $query->where('is_active', true);
        }

        $listings = $query->paginate(20);

        return ServiceListingResource::collection($listings);
    }

    public function store(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_service_listings')) {
            abort(403, 'Funcionalidade nao habilitada.');
        }

        $request->validate([
            'category_id' => 'required|exists:service_categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric',
            'price_type' => 'sometimes|in:fixed,hourly,project',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
        ]);

        $provider = $request->user()->serviceProvider;
        if (!$provider) {
            abort(403, 'Voce nao e um prestador de servico cadastrado.');
        }

        $listing = ServiceListing::create([
            'provider_id' => $provider->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'price_type' => $request->price_type ?? 'fixed',
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'zip_code' => $request->zip_code,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return new ServiceListingResource($listing->load('provider.user', 'category'));
    }

    public function show(ServiceListing $listing)
    {
        return new ServiceListingResource($listing->load('provider.user', 'category'));
    }
}
