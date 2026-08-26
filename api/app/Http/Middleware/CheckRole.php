<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        $user = Auth::user();

        // Se a role do usuário não estiver na lista de roles permitidas
        if (!in_array($user->role, $roles)) {
            abort(403, 'Acesso negado. Você não possui permissão para acessar este recurso.');
        }

        return $next($request);
    }
}