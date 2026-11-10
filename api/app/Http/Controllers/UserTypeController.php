<?php

namespace App\Http\Controllers;

use App\Models\UserType;
use App\Services\UserTypeService;
use Illuminate\Http\Request;

class UserTypeController extends Controller
{
    public function __construct(protected UserTypeService $service)
    {
    }

    /**
     * Listar os papéis de usuário cadastrados (apenas admin).
     */
    public function index()
    {
        return response()->json([
            'data' => $this->service->list(),
        ]);
    }

    /**
     * Criar um novo papel de usuário (apenas admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:user_types,nome',
            'descricao' => 'nullable|string|max:255',
        ]);

        $userType = $this->service->create($validated);

        return response()->json([
            'data' => $userType,
        ], 201);
    }

    /**
     * Exibir um papel de usuário (apenas admin).
     */
    public function show(UserType $userType)
    {
        return response()->json([
            'data' => $userType,
        ]);
    }

    /**
     * Atualizar um papel de usuário (apenas admin).
     */
    public function update(Request $request, UserType $userType)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:user_types,nome,'.$userType->id.',id',
            'descricao' => 'nullable|string|max:255',
        ]);

        $userType = $this->service->update($userType, $validated);

        return response()->json([
            'data' => $userType,
        ]);
    }

    /**
     * Excluir um papel de usuário (apenas admin).
     *
     * Recusado com 409 quando o papel já possui usuários vinculados.
     */
    public function destroy(UserType $userType)
    {
        if (!$this->service->delete($userType)) {
            return response()->json([
                'message' => 'Não é possível excluir um papel que possui usuários vinculados.',
            ], 409);
        }

        return response()->noContent();
    }
}
