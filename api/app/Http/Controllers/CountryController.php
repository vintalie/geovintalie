<?php

namespace App\Http\Controllers;

use App\Models\Country;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $countries = Country::paginate(
            $request->input('per_page', 10)
        );
        
        return response()->json([
            'message' => 'Countries retrieved successfully',
            'countries' => $countries->with('states')
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:countries,code',
        ]);
        $countries = Country::create($validated);
        return response()->json([
            'message' => 'Country created successfully',
            'country' => $countries
        ], 201);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:countries,code',
        ]);
        $country = Country::create($validated);
        return response()->json([
            'message' => 'Country created successfully',
            'country' => $country
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Country $country)
    {
        return response()->json([
            'message' => 'Country retrieved successfully',
            'country' => $country
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Country $country)
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:countries,code,' . $country->id,
        ]);
        $country->update($validated);
        return response()->json([
            'message' => 'Country updated successfully',
            'country' => $country       
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Country $country)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:countries,code,' . $country->id,
        ]);
        $country->update($validated);
        return response()->json([
            'message' => 'Country updated successfully',
            'country' => $country
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Country $country)
    {
        $country->delete();
        return response()->json([
            'message' => 'Country deleted successfully',
        ], 200);
    }
}
