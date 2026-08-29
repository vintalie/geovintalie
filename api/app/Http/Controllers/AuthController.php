<?php

namespace App\Http\Controllers;

use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;


class AuthController extends Controller
{
    function logout(){
        Auth::logout();
        return response()->json([
            'message' => 'User logged out successfully',
        ], 200);
    }
    function login(Request $request){
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        $credentials = $request->only(['email', 'password']); // password vem em texto puro
        $token = Auth::attempt($credentials); // tenta autenticar e gerar token
        if (!$token ) {
            return response()->json([
                'error' => 'Unauthorized',
            ], 401);
        }

        // Se chegou aqui, login bem-sucedido – retorne o token
        return response()->json(compact('token'));
    }
    function refresh(){
        $token = Auth::guard('api')->refresh();
        return response()->json([
            'message' => 'Token refreshed successfully',
            'token' => $token
        ], 200);
    }
    public function me()
    {
        $user = Auth::user();
        return response()->json([
            'message' => 'User information retrieved successfully',
            'user' => new UserResource($user)
        ], 200);
    }

}
