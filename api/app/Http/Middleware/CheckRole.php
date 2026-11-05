<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles  // roles permitidas, separadas por vírgula
     * @return mixed
     */

    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Autentica via JWT (guard 'api')
        try {
            /** @var \App\Models\User $user */
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            abort(401, 'Token não fornecido ou inválido.');
        }

        // Carrega o relacionamento userType se ainda não foi carregado
        $user->loadMissing('userType');

        // Obtém o nome do tipo (role) do usuário
        $userRole = $user->userType->nome ?? null;

        // Se o usuário não tem tipo definido ou não está nas roles permitidas
        if (!$userRole || !in_array($userRole, $roles)) {
            abort(403, 'Acesso negado. Você não possui permissão.');
        }

        return $next($request);
    }
}