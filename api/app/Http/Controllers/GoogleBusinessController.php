<?php

namespace App\Http\Controllers;

use App\Models\GoogleBusinessConnection;
use App\Models\User;
use App\Services\GoogleBusinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
     */
    public function callback(Request $request)
    {
        if ($request->has('error')) {
            return response()->json([
                'message' => 'Autorizacao cancelada pelo Google: ' . $request->error,
                'error' => $request->error,
                'description' => $request->error_description,
            ], Response::HTTP_BAD_REQUEST);
        }

        $request->validate([
            'code' => 'required|string',
            'state' => 'required|string',
        ]);

        $userId = $this->validateState($request->state);

        $tokens = $this->service->exchangeCode($request->code);

        $connection = GoogleBusinessConnection::updateOrCreate(
            ['user_id' => $userId],
            [
                'access_token'  => $tokens['access_token'] ?? null,
                'refresh_token' => $tokens['refresh_token'] ?? null,
                'token_type'    => $tokens['token_type'] ?? null,
                'expires_at'    => isset($tokens['expires_in'])
                    ? now()->addSeconds((int) $tokens['expires_in'])
                    : null,
                'scope'         => $tokens['scope'] ?? null,
                'last_synced_at' => null,
            ]
        );

        return response()->json([
            'message' => 'Conta do Google Business conectada com sucesso.',
            'data' => [
                'user_id' => $userId,
                'token_type' => $connection->token_type,
                'expires_at' => $connection->expires_at,
                'scope' => $connection->scope,
            ],
        ]);
    }

    /**
     * Lista as contas do Google Business Profile do usuario conectado.
     */
    public function accounts(Request $request)
    {
        $connection = $this->getConnection($request->user());
        $accessToken = $this->resolveAccessToken($connection);

        return response()->json([
            'data' => $this->service->fetchAccounts($accessToken),
        ]);
    }

    /**
     * Lista os locais de uma conta do Google Business Profile.
     */
    public function locations(Request $request, string $account)
    {
        $connection = $this->getConnection($request->user(), $account);
        $accessToken = $this->resolveAccessToken($connection);

        return response()->json([
            'account' => $account,
            'data' => $this->service->fetchLocations($accessToken, $account),
        ]);
    }

    /**
     * Sincroniza os dados do perfil empresarial de um local.
     */
    public function sync(Request $request, string $account, string $location)
    {
        $connection = $this->getConnection($request->user(), $account);
        $accessToken = $this->resolveAccessToken($connection);

        $locationData = $this->service->fetchLocation($accessToken, $account, $location);

        $connection->update(['last_synced_at' => now()]);

        return response()->json([
            'account' => $account,
            'location' => $locationData,
            'synced_at' => $connection->fresh()->last_synced_at,
        ]);
    }

    /**
     * Revoga o token e desconta o Google Business Profile do usuario.
     */
    public function disconnect(Request $request)
    {
        $user = $request->user();
        $connection = GoogleBusinessConnection::where('user_id', $user->id)->first();

        if ($connection?->refresh_token && $connection->token_type) {
            $this->service->revokeToken($connection->refresh_token);
        }

        $connection?->delete();

        return response()->json([
            'message' => 'Conta do Google Business desconectada com sucesso.',
        ]);
    }

    protected function getConnection(User $user, ?string $account = null): GoogleBusinessConnection
    {
        $connection = GoogleBusinessConnection::where('user_id', $user->id)->first();

        if (! $connection) {
            abort(Response::HTTP_NOT_FOUND, 'Nenhuma conta do Google Business conectada para este usuario.');
        }

        return $connection;
    }

    protected function resolveAccessToken(GoogleBusinessConnection $connection): string
    {
        if (! $connection->expiradoOuProximoDeExpirar()) {
            return $connection->access_token;
        }

        if (! $connection->refresh_token) {
            abort(Response::HTTP_UNAUTHORIZED, 'O token de acesso expirou e nao eh possivel renova-lo. Reconecte a conta.');
        }

        $tokens = $this->service->refreshAccessToken($connection->refresh_token);

        $connection->update([
            'access_token' => $tokens['access_token'] ?? $connection->access_token,
            'expires_at'   => isset($tokens['expires_in'])
                ? now()->addSeconds((int) $tokens['expires_in'])
                : $connection->expires_at,
        ]);

        return $tokens['access_token'] ?? $connection->access_token;
    }

    protected function validateState(string $state): int
    {
        $decoded = base64_decode($state, true);
        if ($decoded === false) {
            abort(Response::HTTP_BAD_REQUEST, 'Estado da autorizacao invalido.');
        }

        [$payload, $signature] = explode('.', $decoded, 2);
        if (! $payload || ! $signature || ! hash_equals($signature, hash_hmac('sha256', $payload, config('app.key')))) {
            abort(Response::HTTP_BAD_REQUEST, 'Estado da autorizacao invalido.');
        }

        $data = json_decode($payload, true);
        if (! $data || ! isset($data['u'], $data['t'])) {
            abort(Response::HTTP_BAD_REQUEST, 'Estado da autorizacao invalido.');
        }

        if (now()->timestamp - (int) $data['t'] > 600) {
            abort(Response::HTTP_BAD_REQUEST, 'Estado da autorizacao expirou. Inicie a conexao novamente.');
        }

        $user = User::find((int) $data['u']);
        if (! $user) {
            abort(Response::HTTP_NOT_FOUND, 'Usuario da autorizacao nao encontrado.');
        }

        return (int) $data['u'];
    }
}
