<?php

namespace App\Http\Controllers;

use App\Models\City;
use Illuminate\Http\Request;

class CityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $cities = City::paginate(
            $request->input('per_page', 10)
        );
        
        return response()->json([
            'message' => 'Cities retrieved successfully',
            'cities' => $cities
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'state_id' => 'required|exists:states,id',
        ]);

        $cities = City::create($validated);
        return response()->json([
            'message' => 'City created successfully',
            'city' => $cities
        ], 201);
    }

    /**
     * Store a newly created resource in storage.
            'country' => 'New Country',
        ]);
        return response()->json([
            'message' => 'City created successfully',
            'city' => $cities
        ], 201);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'state_id' => 'required|exists:states,id',
        ]);
        $city = City::create($validated);
        return response()->json([
            'message' => 'City created successfully',
            'city' => $city
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(City $city)
    {
        return response()->json([
            'message' => 'City retrieved successfully',
            'city' => $city
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(City $city)
    {
        $cities = City::find($city->id);
        return response()->json([
            'message' => 'City retrieved successfully',
            'city' => $cities
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, City $city)
    {   
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'state_id' => 'sometimes|required|exists:states,id',
        ]);
        $city->update($validated);
        return response()->json([
            'message' => 'City updated successfully',
            'city' => $city
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(City $city)
    {
        $city->delete();
        return response()->json([
            'message' => 'City deleted successfully',
        ], 200);
    }
}
