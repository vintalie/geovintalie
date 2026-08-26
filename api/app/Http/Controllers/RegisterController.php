<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Http\Request;

class RegisterController extends Controller
{
function register(Request $request){
    // Validação básica (opcional, mas recomendada)
    $request->validate([
        'name' => 'required|string',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => bcrypt($request->password),
    ]);

    // Verifique se a criação foi bem-sucedida
    if (!$user) {
        return response()->json([
            'message' => 'User registration failed',
        ], 500);
    }

    // Gera o token com as credenciais
    $token = Auth::attempt($request->only('email', 'password'));

    return response()->json([
        'message' => 'User created successfully',
        'user' => $user, // Use a variável $user, não Auth::user()
        'token' => $token,
    ], 201);
}
    function twofa(Request $request){
        return response()->json([
            'message' => 'not implemented yet',
        ], 501);
    }
    function verify_email(Request $request){
        return response()->json([
            'message' => 'not implemented yet',
        ], 501);
    }
}
