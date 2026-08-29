<?php

namespace App\Http\Controllers;

use App\Models\ConfigsInterface;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    public function index (Request $request) {
        $users = User::with('userType')->paginate(10);
        return UserResource::collection($users);
    }
    public function store () {}
    public function create () {}
public function show($id)
{
    $user = User::with('userType')->findOrFail($id);
    return new UserResource($user);
}
    public function edit () {}
    public function destroy () {}
    public function config () {}
}
