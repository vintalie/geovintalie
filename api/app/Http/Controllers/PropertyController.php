<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Street;
use App\Models\Neighborhood;
use App\Models\City;
use App\Models\State;
use App\Models\Country;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Property::query();

        // Usuário comum vê apenas suas próprias propriedades; o admin vê todas.
        if ($user && (optional($user->userType)->nome ?? null) !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $propertys = $query->paginate($request->input('per_page', 10));

        return response()->json([
            'message' => 'Properties retrieved successfully',
            'propertys' => $propertys,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     * Rua e bairro são criados automaticamente quando não existem.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'n_property'       => 'required|string|max:255',
            'complement'       => 'nullable|string|max:255',
            'main_image'       => 'nullable|string|max:255',
            'cover_image'      => 'nullable|string|max:255',
            'content_html'     => 'nullable|string|max:255',
            'additional_info'  => 'nullable|string|max:255',
            'contact1_email'   => 'nullable|email|max:255',
            'contact2_email'   => 'nullable|email|max:255',
            'number1'          => 'nullable|string|max:255',
            'number2'          => 'nullable|string|max:255',
            'number3'          => 'nullable|string|max:255',
            'street_id'        => 'nullable|exists:streets,id',
            'street'           => 'nullable|string|max:255',
            'neighborhood'     => 'nullable|string|max:255',
            'city'             => 'nullable|string|max:255',
            'state'            => 'nullable|string|max:255',
            'country'          => 'nullable|string|max:255',
        ]);

        $streetId = $validated['street_id'] ?? null;

        if (!$streetId && !empty($validated['street'])) {
            $streetId = $this->resolveStreet(
                $validated['street'],
                $validated['neighborhood'] ?? null,
                $validated['city'] ?? null,
                $validated['state'] ?? null,
                $validated['country'] ?? null
            );
        }

        if (!$streetId) {
            return response()->json([
                'message' => 'Informe a rua (street_id) ou o endereço completo (rua, bairro, cidade, estado, país).',
            ], 422);
        }

        $data = array_intersect_key($validated, array_flip([
            'name', 'n_property', 'complement', 'main_image', 'cover_image',
            'content_html', 'additional_info', 'contact1_email', 'contact2_email',
            'number1', 'number2', 'number3',
        ]));
        $data['street_id'] = $streetId;
        $data['user_id'] = Auth::id();

        $property = Property::create($data);

        return response()->json([
            'message' => 'Property created successfully',
            'property' => $property,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        $this->authorizeOwnerOrAdmin($property);

        return response()->json([
            'message' => 'Property retrieved successfully',
            'property' => $property->load('address', 'productStock.stock'),
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Property $property)
    {
        $this->authorizeOwnerOrAdmin($property);

        $validated = $request->validate([
            'name'             => 'sometimes|required|string|max:255',
            'n_property'       => 'sometimes|required|string|max:255',
            'complement'       => 'nullable|string|max:255',
            'main_image'       => 'nullable|string|max:255',
            'cover_image'      => 'nullable|string|max:255',
            'content_html'     => 'nullable|string|max:255',
            'additional_info'  => 'nullable|string|max:255',
            'contact1_email'   => 'nullable|email|max:255',
            'contact2_email'   => 'nullable|email|max:255',
            'number1'          => 'nullable|string|max:255',
            'number2'          => 'nullable|string|max:255',
            'number3'          => 'nullable|string|max:255',
            'street_id'        => 'nullable|exists:streets,id',
            'street'           => 'nullable|string|max:255',
            'neighborhood'     => 'nullable|string|max:255',
            'city'             => 'nullable|string|max:255',
            'state'            => 'nullable|string|max:255',
            'country'          => 'nullable|string|max:255',
        ]);

        if (!empty($validated['street'])) {
            $validated['street_id'] = $this->resolveStreet(
                $validated['street'],
                $validated['neighborhood'] ?? null,
                $validated['city'] ?? null,
                $validated['state'] ?? null,
                $validated['country'] ?? null
            );
        }

        $data = array_intersect_key($validated, array_flip([
            'name', 'n_property', 'complement', 'main_image', 'cover_image',
            'content_html', 'additional_info', 'contact1_email', 'contact2_email',
            'number1', 'number2', 'number3', 'street_id',
        ]));

        $property->update($data);

        return response()->json([
            'message' => 'Property updated successfully',
            'property' => $property->load('address'),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Property $property)
    {
        $this->authorizeOwnerOrAdmin($property);

        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully',
        ], 200);
    }

    /**
     * Resolve (creating when missing) the location hierarchy and returns the street_id.
     */
    private function resolveStreet(string $streetName, ?string $neighborhoodName, ?string $cityName, ?string $stateName, ?string $countryName): int
    {
        $country = Country::firstOrCreate(
            ['name' => $countryName ?? 'Brasil'],
            ['name' => $countryName ?? 'Brasil']
        );

        $state = State::firstOrCreate(
            ['name' => $stateName ?? 'São Paulo', 'country_id' => $country->id],
            ['abbreviation' => 'SP', 'name' => $stateName ?? 'São Paulo', 'country_id' => $country->id]
        );

        $city = City::firstOrCreate(
            ['name' => $cityName ?? 'São Paulo', 'state_id' => $state->id],
            ['name' => $cityName ?? 'São Paulo', 'state_id' => $state->id]
        );

        $neighborhood = Neighborhood::firstOrCreate(
            ['name' => $neighborhoodName ?? 'Centro', 'city_id' => $city->id],
            ['name' => $neighborhoodName ?? 'Centro', 'city_id' => $city->id]
        );

        $street = Street::firstOrCreate(
            ['name' => $streetName, 'neighborhood_id' => $neighborhood->id],
            ['name' => $streetName, 'neighborhood_id' => $neighborhood->id]
        );

        return (int) $street->id;
    }

    /**
     * Garante que apenas o dono da propriedade ou um admin possa acessá-la.
     */
    private function authorizeOwnerOrAdmin(Property $property): void
    {
        $user = Auth::user();
        if (!$user || ($property->user_id !== $user->id && (optional($user->userType)->nome ?? null) !== 'admin')) {
            abort(403, 'Acesso negado. Você não possui permissão sobre esta propriedade.');
        }
    }
}
