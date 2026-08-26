<?php

namespace App\Http\Controllers;

use App\Models\ConfigsInterface;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index (Request $request) {
        $users = User::paginate(
            $request->input('per_page', 10)
        );
        return response()->json([
            'message' => "User retrieved successfully",
            'users' => $users
        ],200);
    }
    public function store () {}
    public function create () {}
    public function show () {}
    public function edit () {}
    public function destroy () {}
    public function config () {}
}
