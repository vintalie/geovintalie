<?php

namespace App\Http\Controllers;

use App\Models\GoogleBusinessToken;
use App\Models\User;
use App\Services\GoogleBusinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class GoogleBusinessController extends Controller
{
    public function __construct(
        protected GoogleBusinessService $service,
    ) {}

    /**
     * Inicia o fluxo OAuth 2.0: redireciona o usuario para a tela de consentimento do Google.
     */
    public function authorize(Request $request): RedirectResponse
    {
        if (!$this->service->isConfigured()) {
            abort(Response::HTTP_INTERNAL_SERVER_ERROR, 'Google Business Profile OAuth nao esta configurado no servidor.');
        }

        $user = $request->user();

        $payload = json_encode([
            'u' => $user->id,
            'n' => Str::random(24),
            't' => now()->timestamp,
        ]);

        $state = base64_encode($payload . '.' . hash_hmac('sha256', $payload, config('app.key')));

        return redirect()->away($this->service->authorizeUrl($state));
    }

    /**
     * Callback do Google OAuth 2.0. Troca o codigo pelo token e salva na base do usuario.
     * Chamado pelo navegador do usuario apos a consentimento no Google; identifica o
     * usuario pelo parametro `state` assinado (nao exige autenticacao JWT).
     */
    public function callback(Request $request)
    {
        if ($request->has('error')) {
            return $this->finishWithError('Autorizacao cancelada pelo Google: ' . $request->error);
        }

        $request->validate([
            'code' => 'required|string',
            'state' => 'required|string',
        ]);

        $userId = $this->validateState($request->state);

        $tokens = $this->service->exchangeCode($request->code);

        $accessToken = $tokens['access_token'] ?? '';
        $accountId = null;
        $accountName = null;

        // Descobre a conta do Google Business Profile do usuario (se houver).
        try {
            $accounts = $this->service->fetchAccounts($accessToken);
            $account = $accounts[0] ?? null;
            $accountId = $account['name'] ?? null;
            $accountName = $account['accountName'] ?? $account['displayName'] ?? null;
        } catch (\Throwable $e) {
            // Nao bloqueia o fluxo por causa da listagem de contas.
        }

        GoogleBusinessToken::updateOrCreate(
            ['user_id' => $userId],
            [
                'google_account_id'   => $accountId,
                'google_account_name' => $accountName,
                'access_token'        => $accessToken,
                'refresh_token'       => $tokens['refresh_token'] ?? null,
                'token_type'          => $tokens['token_type'] ?? 'Bearer',
                'expires_at'          => isset($tokens['expires_in'])
                    ? now()->addSeconds((int) $tokens['expires_in'])
                    : null,
                'scopes'              => implode(' ', $this->service->scopes()),
            ]
        );

        return $this->finishWithSuccess();
    }

    /**
     * Lista as contas do Google Business Profile do usuario conectado.
     */
    public function accounts(Request $request)
    {
        $token = $this->resolveToken($request);
        $accessToken = $this->resolveAccessToken($token);

        try {
            $accounts = $this->service->fetchAccounts($accessToken);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Falha ao listar contas do Google Business Profile.',
                'error' => $e->getMessage(),
            ], 502);
        }

        return response()->json([
            'message' => 'Contas do Google Business Profile listadas com sucesso.',
            'data' => $accounts,
        ]);
    }

    /**
     * Lista os locais (estabelecimentos) de uma conta.
     */
    public function locations(Request $request, string $account)
    {
        $token = $this->resolveToken($request);
        $accessToken = $this->resolveAccessToken($token);

        try {
            $locations = $this->service->fetchLocations($accessToken, $account);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Falha ao listar locais do Google Business Profile.',
                'error' => $e->getMessage(),
            ], 502);
        }

        return response()->json([
            'message' => 'Locais listados com sucesso.',
            'account' => $account,
            'data' => $locations,
        ]);
    }

    /**
     * Sincroniza os dados do perfil empresarial de um local.
     */
    public function sync(Request $request, string $account, string $location)
    {
        $token = $this->resolveToken($request);
        $accessToken = $this->resolveAccessToken($token);

        try {
            $profile = $this->service->fetchLocation($accessToken, $account, $location);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Falha ao sincronizar dados do perfil empresarial.',
                'error' => $e->getMessage(),
            ], 502);
        }

        $token->update(['profile_data' => $profile]);

        return response()->json([
            'message' => 'Perfil empresarial sincronizado com sucesso.',
            'data' => $profile,
        ]);
    }

    /**
     * Revoga o token no Google e remove a integracao do banco do usuario.
     */
    public function disconnect(Request $request)
    {
        $token = GoogleBusinessToken::where('user_id', $request->user()->id)->first();

        if ($token?->getPlainRefreshToken()) {
            try {
                $this->service->revokeToken($token->getPlainRefreshToken());
            } catch (\Throwable $e) {
                // Nao bloqueia a desligacao local por falha na revogacao remota.
            }
        }

        $token?->delete();

        return response()->json([
            'message' => 'Integracao com o Google Business Profile removida com sucesso.',
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                            */
    /* ------------------------------------------------------------------ */

    protected function resolveToken(Request $request): GoogleBusinessToken
    {
        $token = GoogleBusinessToken::where('user_id', $request->user()->id)->first();

        if (!$token) {
            abort(Response::HTTP_NOT_FOUND, 'Nenhuma integracao com o Google Business Profile encontrada para este usuario. Acesse /authorize primeiro.');
        }

        return $token;
    }

    /**
     * Retorna o access token valido, renovando automaticamente se estiver expirado.
     */
    protected function resolveAccessToken(GoogleBusinessToken $token): string
    {
        if (!$token->isExpired()) {
            $accessToken = $token->getPlainAccessToken();
            if (! $accessToken) {
                abort(Response::HTTP_UNAUTHORIZED, 'Nenhuma integracao com o Google Business Profile encontrada.');
            }
            return $accessToken;
        }

        if (!$token->getPlainRefreshToken()) {
            abort(Response::HTTP_UNAUTHORIZED, 'O token de acesso expirou e nao eh possivel renova-lo. Reconecte a conta.');
        }

        $refreshed = $this->service->refreshAccessToken($token->getPlainRefreshToken());

        $token->update([
            'access_token' => $refreshed['access_token'] ?? $token->getPlainAccessToken(),
            'token_type'   => $refreshed['token_type'] ?? $token->token_type,
            'expires_at'   => isset($refreshed['expires_in'])
                ? now()->addSeconds((int) $refreshed['expires_in'])
                : $token->expires_at,
        ]);

        return $refreshed['access_token'] ?? $token->getPlainAccessToken();
    }

    /**
     * Valida o parametro state assinado e retorna o id do usuario.
     */
    protected function validateState(string $state): int
    {
        $decoded = base64_decode($state, true);
        if ($decoded === false) {
            abort(Response::HTTP_BAD_REQUEST, 'Estado da autorizacao invalido.');
        }

        [$payload, $signature] = explode('.', $decoded, 2);
        if (!$payload || !$signature || !hash_equals($signature, hash_hmac('sha256', $payload, config('app.key')))) {
            abort(Response::HTTP_BAD_REQUEST, 'Estado da autorizacao invalido.');
        }

        $data = json_decode($payload, true);
        if (!$data || !isset($data['u'], $data['t'])) {
            abort(Response::HTTP_BAD_REQUEST, 'Estado da autorizacao invalido.');
        }

        if (now()->timestamp - (int) $data['t'] > 600) {
            abort(Response::HTTP_BAD_REQUEST, 'Estado da autorizacao expirou. Inicie a conexao novamente.');
        }

        $user = User::find((int) $data['u']);
        if (!$user) {
            abort(Response::HTTP_NOT_FOUND, 'Usuario da autorizacao nao encontrado.');
        }

        return (int) $data['u'];
    }

    protected function finishWithSuccess(): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $frontend = config('google_business.frontend_redirect_uri');

        if ($frontend) {
            return redirect(rtrim($frontend, '/') . '?google_business=success');
        }

        return response()->json([
            'message' => 'Autorizacao com o Google Business Profile concluida com sucesso. Tokens salvos.',
        ], 200);
    }

    protected function finishWithError(string $message): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $frontend = config('google_business.frontend_redirect_uri');

        if ($frontend) {
            return redirect(rtrim($frontend, '/') . '?google_business=error&message=' . urlencode($message));
        }

        return response()->json([
            'message' => $message,
        ], 400);
    }
}
