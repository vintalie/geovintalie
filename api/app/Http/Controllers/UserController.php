<?php

namespace App\Http\Controllers;

use App\Models\ConfigsInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserType;
use App\Services\UserTypeService;

class UserController extends Controller
{
    public function __construct(protected UserTypeService $service)
    {
    }
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
    public function update (Request $request) {
        $request->validate([
            'id' => 'exists:users,id',
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,',
            'phone' => 'string|max:20',
            'tipo_nome' => 'exists:user_types,nome',
            'updated_at' => 'date',
            'created_at' => 'date',
        ]);
        $user = User::findOrFail($request->id);
        $user->update($request->only(['name', 'email', 'phone', 'tipo_nome', 'updated_at', 'created_at']));
        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ], 200);
    }
public function show($id)
{
$user = User::with('userType')->findOrFail($id);
return new UserResource($user);
}

/**
* Vincula um usuário a um papel (tipo de usuário) - apenas admin.
*/
public function updateRole(Request $request, $id)
{
$user = User::findOrFail($id);

$request->validate([
    'tipo_id' => 'required|exists:user_types,id',
]);

$userType = UserType::findOrFail($request->tipo_id);
$user = $this->service->assignToUser($user, $userType);

return new UserResource($user);
}

public function edit () {}
    public function destroy () {}
    public function config () {}
}
