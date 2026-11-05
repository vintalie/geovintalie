<?php

namespace App\Http\Controllers;

use App\Models\ConfigsInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request) {
        $user = Auth::user();
        if ((optional($user->userType)->nome ?? null) !== 'admin') {
            abort(403, 'Acesso negado. Apenas administradores podem listar usuários.');
        }
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
