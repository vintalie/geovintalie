<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Support\Facades\Auth;

use Illuminate\Http\Request;
use Exception;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $propertys = Property::paginate(
            $request->input('per_page', 10)
        );

        return response()->json([
            'message'    => 'Propertys retrieved successfully',
            'propertys'  => $propertys
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $validated = request()->validate([
            'name'             => 'required|string|max:255',
            'complement'       => 'required|string|max:255',
            'n_property'       => 'required|string|max:255',
            'main_image'       => 'required|string|max:255',
            'cover_image'      => 'required|string|max:255',
            'content_html'     => 'required|string|max:255',
            'additional_info'  => 'required|string|max:255',
            'contact1_email'   => 'required|string|max:255', // como esta
            'contact2_email'   => 'required|string|max:255', // o seu toc
            'number1'           => 'required|string|max:255',// hoje?
            'number2'          => 'required|string|max:255',
            'number3'          => 'required|string|max:255',
            'street_id'        => 'required|string|max:255',
            'user_id'        => 'required|string|max:255',
        ]);
        $validated['user_id'] = Auth::user();// ou $request->user()->id
        $property = Property::create($validated);
        return response()->json([
            'message'   => 'Property created sucessfully',
            'propery'   => $property 
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = request()->validate([
            'name'             => 'required|string|max:255',
            'complement'       => 'required|string|max:255',
            'n_property'       => 'required|string|max:255',
            'main_image'       => 'required|string|max:255',
            'cover_image'      => 'required|string|max:255',
            'content_html'     => 'required|string|max:255',
            'additional_info'  => 'required|string|max:255',
            'contact1_email'   => 'required|string|max:255', // como esta
            'contact2_email'   => 'required|string|max:255', // o seu to
            'number1'           => 'required|string|max:255',// hoje?
            'number2'          => 'required|string|max:255',
            'number3'          => 'required|string|max:255',
            'street_id'          => 'required|string|max:255',

        ]);
        $validated['user_id'] = Auth::id();// ou $request->user()->id

        $property = Property::create($validated);
        
        return response()->json([
            'message'   => 'Property created sucessfully',
            'propery'   => $property 
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        try{}catch(Exception $err){

        }


    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Property $property)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Property $property)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Property $property)
    {
        //
    }
}
