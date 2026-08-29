<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\UserTypeController;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use App\Models\User;
use App\Http\Resources\UserResource;


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
        // Verifica se o usuário está autenticado
        if (!Auth::check()) {
            abort(401, 'Não autenticado.');
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

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