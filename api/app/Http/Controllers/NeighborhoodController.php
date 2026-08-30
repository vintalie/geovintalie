<?php

namespace App\Http\Controllers;

use App\Models\Neighborhood;
use Illuminate\Http\Request;

class NeighborhoodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $neighborhoods = Neighborhood::paginate(
            $request->input('per_page', 10)
        );
        
        return response()->json([
            'message' => 'Neighborhoods retrieved successfully',
            'neighborhoods' => $neighborhoods
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',

        ]);
        $neighborhood = Neighborhood::create($validated);
        dd($neighborhood);
        return response()->json([
            'message' => 'Neighborhood created successfully',
            'neighborhood' => $neighborhood
        ], 201);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',

            
        ]);
        $neighborhood = Neighborhood::create($validated);
        return response()->json([
            'message' => 'Neighborhood created successfully',
            'neighborhood' => $neighborhood
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Neighborhood $neighborhood)
    {
        return response()->json([
            'message' => 'Neighborhood retrieved successfully',
            'neighborhood' => $neighborhood
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Neighborhood $neighborhood)
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',

        ]);
        $neighborhood->update($validated);
        return response()->json([
            'message' => 'Country updated successfully',
            'neighborhood' => $neighborhood       
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Neighborhood $neighborhood)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city_id' => 'required|exists:cities,id',

        ]);
        $neighborhood->update($validated);
        return response()->json([
            'message' => 'Neighborhood updated successfully',
            'neighborhood' => $neighborhood
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Neighborhood $neighborhood)
    {
        $neighborhood->delete();
        return response()->json([
            'message' => 'neighborhood deleted successfully',
        ], 200);
    }
}
