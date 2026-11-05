<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceProviderResource;
use App\Models\FeatureFlag;
use App\Models\ServiceCategory;
use App\Models\ServiceListing;
use App\Models\ServiceProvider;
use Illuminate\Http\Request;

class ServiceProviderController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceProvider::with('user');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $providers = $query->paginate(20);

        return ServiceProviderResource::collection($providers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'business_name' => 'required|string|max:255',
            'cnpj_cpf' => 'nullable|string|max:20',
            'description' => 'nullable|string',
        ]);

        $provider = ServiceProvider::create([
            'user_id' => $request->user()->id,
            'business_name' => $request->business_name,
            'cnpj_cpf' => $request->cnpj_cpf,
            'description' => $request->description,
        ]);

        return new ServiceProviderResource($provider);
    }

    public function show(ServiceProvider $provider)
    {
        return new ServiceProviderResource($provider->load('user'));
    }

    public function update(Request $request, ServiceProvider $provider)
    {
        if ($provider->user_id !== $request->user()->id) {
            abort(403, 'Acesso negado. Voce nao e o proprietario deste prestador.');
        }

        $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'cnpj_cpf' => 'sometimes|string|max:20',
            'description' => 'sometimes|string',
            'avatar_url' => 'sometimes|string|max:500',
            'cover_url' => 'sometimes|string|max:500',
            'is_active' => 'sometimes|boolean',
        ]);

        $provider->update($request->only([
            'business_name',
            'cnpj_cpf',
            'description',
            'avatar_url',
            'cover_url',
            'is_active',
        ]));

        return new ServiceProviderResource($provider->fresh());
    }
}
