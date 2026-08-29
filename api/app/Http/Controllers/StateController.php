<?php

namespace App\Http\Controllers;

use App\Models\State;
use App\Http\Resources\StateResource;
use Exception;
use Illuminate\Http\Request;

class StateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        try{
            $perPage = $request->input('per_page', 10);
            $states = State::with('country')->paginate($perPage);
            return StateResource::collection($states);
            
        }catch(Exception $err){
            return response()->json([
                'message' => 'Erro Interno do servidor',
                'err' => $err
            ], 500);
        };
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'abbreviation' => 'required|string|max:2',
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
            'abbreviation' => 'required|string|max:2',
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
    public function show($id)
{
        try {
            // Carrega o estado com o país relacionado
            $state = State::with('country')->findOrFail($id);
            return new StateResource($state);
        } catch (\Exception $err) {
            return response()->json([
                'message' => 'Estado não encontrado',
                'error' => $err->getMessage()
            ], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(State $state)
    {
        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'abbreviation' => 'required|string|max:2',
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
            'abbreviation' => 'required|string|max:2',
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
