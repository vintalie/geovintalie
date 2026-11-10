<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserType;

/**
 * Regras de negócio de gerenciamento de papéis (user types) — Escopo C1.
 *
 * Os papéis são consumidor, lojista, prestador, indústria e admin
 * (além de user/public já existentes). A autorização por papel já é feita
 * pelo middleware role:; este serviço foca no CRUD dos papéis e na
 * vinculação de usuários a um papel.
 */
class UserTypeService
{
    /** Lista todos os papéis cadastrados, ordenados por nome. */
    public function list()
    {
        return UserType::orderBy('nome')->get();
    }

    /** Cadastra um novo papel. */
    public function create(array $data): UserType
    {
        return UserType::create($data);
    }

    /** Atualiza um papel existente. */
    public function update(UserType $userType, array $data): UserType
    {
        $userType->update($data);

        return $userType->fresh();
    }

    /**
     * Exclui um papel.
     *
     * Retorna false quando o papel já possui usuários vinculados, preservando
     * a integridade referencial da tabela users (tipo_id -> user_types.id).
     */
    public function delete(UserType $userType): bool
    {
        if ($userType->user()->exists()) {
            return false;
        }

        $userType->delete();

        return true;
    }

    /** Vincula um usuário a um papel (tipo de usuário). */
    public function assignToUser(User $user, UserType $userType): User
    {
        $user->tipo_id = $userType->id;
        $user->save();

        return $user->fresh('userType');
    }
}
