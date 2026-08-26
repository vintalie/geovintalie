<?php

namespace App\Http\Controllers;

use App\Models\State;
use Illuminate\Http\Request;

class StateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $states = State::paginate(
            $request->input('per_page', 10)
        );

        return response()->json([
            'message' => 'States retrieved successfully',
            'states' => $states->with('country')
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'country_id' => 'required|exists:countries,id',
        ]);
        $states = State::create($validated);
        return response()->json([
            'message' => 'State created successfully',
            'state' => $states
        ], 201);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country_id' => 'required|exists:countries,id',
        ]);
        $state = State::create($validated);
        return response()->json([
            'message' => 'State created successfully',
            'state' => $state
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(State $state)
    {
        return response()->json([
            'message' => 'State retrieved successfully',
            'state' => $state->cities()->countrys()
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(State $state)
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'country_id' => 'required|exists:countries,id',
        ]);
        $state->update($validated);
        return response()->json([
            'message' => 'State updated successfully',
            'state' => $state
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, State $state)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country_id' => 'required|exists:countries,id',
        ]);
        $state->update($validated);
        return response()->json([
            'message' => 'State updated successfully',
            'state' => $state
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(State $state)
    {
        $state->delete();
        return response()->json([
            'message' => 'State deleted successfully'
        ], 200);
    }
}
