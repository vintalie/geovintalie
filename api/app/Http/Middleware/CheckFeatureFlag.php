<?php

namespace App\Http\Middleware;

use App\Models\FeatureFlag;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de feature flag.
 *
 * Uso nas rotas: 'feature.flag:ff_o2o_locator'
 *
 * Bloqueia a requisicao com 403 quando a feature flag nao estiver habilitada,
 * permitindo ativar/desativar escopos inteis (ex: Escopo A2 - Google Business Profile)
 * sem alterar as rotas.
 */
class CheckFeatureFlag
{
    public function handle(Request $request, Closure $next, string $flag)
    {
        if (! FeatureFlag::isEnabled($flag)) {
            return response()->json([
                'message' => "Recurso desabilitado: feature flag '{$flag}' nao esta ativa.",
                'flag' => $flag,
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
