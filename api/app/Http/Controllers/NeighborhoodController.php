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
            'neighborhoods' => $neighborhoods->with('city')
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $neighborhoods = Neighborhood::create([
            'name' => 'New Neighborhood',
            'city_id' => 1, // Replace with a valid city ID
        ]);
        return response()->json([
            'message' => 'Neighborhood created successfully',
            'neighborhood' => $neighborhoods
        ], 201);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Neighborhood $neighborhood)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Neighborhood $neighborhood)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Neighborhood $neighborhood)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Neighborhood $neighborhood)
    {
        //
    }
}
