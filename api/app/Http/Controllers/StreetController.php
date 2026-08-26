<?php

namespace App\Http\Controllers;

use App\Models\Street;
use Illuminate\Http\Request;

class StreetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $streets = Street::paginate(
            $request->input('per_page', 10)
        );
        return response()->json([
            'message' => 'Streets retrieved successfully',
            'streets' => $streets->with('neighborhood')
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'neighborhood_id' => 'required|exists:neighborhoods,id',
        ]);
        $streets = Street::create($validated);
        return response()->json([
            'message' => 'Street created successfully',
            'street' => $streets->with('neighborhood')
        ], 201);
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'neighborhood_id' => 'required|exists:neighborhoods,id',
        ]);
        $street = Street::create($validated);
        return response()->json([
            'message' => 'Street created successfully',
            'street' => $street->with('neighborhood')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Street $street)
    {
        return response()->json([
            'message' => 'Street retrieved successfully',
            'street' => $street->with('neighborhood')
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Street $street)
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'neighborhood_id' => 'required|exists:neighborhoods,id',
        ]);
        $street->update($validated);
        return response()->json([
            'message' => 'Street updated successfully',
            'street' => $street->with('neighborhood')
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Street $street)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'neighborhood_id' => 'required|exists:neighborhoods,id',
        ]);
        $street->update($validated);
        return response()->json([
            'message' => 'Street updated successfully',
            'street' => $street->with('neighborhood')
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Street $street)
    {
        $street->delete();
        return response()->json([
            'message' => 'Street deleted successfully'
        ], 200);
    }
}
