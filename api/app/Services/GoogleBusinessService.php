<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleBusinessService
{
    public function __construct(
        protected string $clientId,
        protected string $clientSecret,
        protected string $redirectUri,
        protected string $authUri,
        protected string $tokenUri,
        protected string $baseUrl,
        protected array $scopes,
    ) {}

    public static function makeFromConfig(): self
    {
        $config = config('google_business');

        return new self(
            clientId:     $config['client_id'] ?? '',
            clientSecret: $config['client_secret'] ?? '',
            redirectUri:  $config['redirect_uri'] ?? '',
            authUri:      $config['auth_uri'] ?? 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUri:     $config['token_uri'] ?? 'https://oauth2.googleapis.com/token',
            baseUrl:      $config['base_url'] ?? 'https://mybusinessbusinessinformation.googleapis.com/v1',
            scopes:       $config['scopes'] ?? [],
        );
    }

    public function scopes(): array
    {
        return $this->scopes;
    }

    public function isConfigured(): bool
    {
        return (bool) ($this->clientId && $this->clientSecret && $this->redirectUri);
    }

    public function authorizeUrl(string $state): string
    {
        $query = http_build_query([
            'client_id'     => $this->clientId,
            'redirect_uri'  => $this->redirectUri,
            'response_type' => 'code',
            'scope'         => implode(' ', $this->scopes),
            'access_type'   => 'offline', // garante refresh_token
            'prompt'        => 'consent', // garante refresh_token em re-autorizacoes
            'state'         => $state,
        ]);

        return "{$this->authUri}?{$query}";
    }

    public function exchangeCode(string $code): array
    {
        $response = Http::timeout(3)->tracePropagation()->post($this->tokenUri, [
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'code'          => $code,
            'grant_type'    => 'authorization_code',
            'redirect_uri'  => $this->redirectUri,
        ]);

        if (! $response->successful()) {
            throw new RuntimeException(
                'Falha ao trocar o codigo de autorizacao pelo token: ' . $response->body()
            );
        }

        return $response->json();
    }

    public function refreshAccessToken(string $refreshToken): array
    {
        $response = Http::timeout(3)->tracePropagation()->post($this->tokenUri, [
            'client_id'     => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $refreshToken,
            'grant_type'    => 'refresh_token',
        ]);

        if (! $response->successful()) {
            throw new RuntimeException(
                'Falha ao renovar o token de acesso: ' . $response->body()
            );
        }

        return $response->json();
    }

    public function revokeToken(string $token): bool
    {
        $response = Http::timeout(3)->tracePropagation()->post('https://oauth2.googleapis.com/revoke', [
            'token' => $token,
        ]);

        return $response->successful();
    }

    public function fetchAccounts(string $accessToken): array
    {
        $response = Http::withToken($accessToken)->tracePropagation()->get("{$this->baseUrl}/accounts");

        if (! $response->successful()) {
            throw new RuntimeException(
                'Falha ao listar contas do Google Business: ' . $response->body()
            );
        }

        return $response->json('accounts') ?? [];
    }

    /**
     * Lista os locais de uma conta específica ou de todas as contas acessíveis.
     */
    public function fetchLocations(string $accessToken, ?string $account = null): array
    {
        $url = $account
            ? "{$this->baseUrl}/accounts/{$account}/locations"
            : "{$this->baseUrl}/locations";

        $response = Http::withToken($accessToken)->tracePropagation()->get($url);

        if (! $response->successful()) {
            throw new RuntimeException(
                'Falha ao listar locais do Google Business Profile: ' . $response->body()
            );
        }

        return $response->json('locations') ?? [];
    }

    public function fetchLocation(string $accessToken, string $account, string $location): array
    {
        $response = Http::withToken($accessToken)->tracePropagation()
            ->get("{$this->baseUrl}/accounts/{$account}/locations/{$location}");

        if (! $response->successful()) {
            throw new RuntimeException(
                'Falha ao sincronizar o local {$location}: ' . $response->body()
            );
        }

        return $response->json() ?? [];
    }

    /**
     * Busca um local pelo resource name completo (ex: accounts/123/locations/456).
     */
    public function fetchLocationByName(string $accessToken, string $locationName): array
    {
        $response = Http::withToken($accessToken)->tracePropagation()->get("{$this->baseUrl}/{$locationName}");

        if (! $response->successful()) {
            throw new RuntimeException(
                'Falha ao buscar dados do local {$locationName}: ' . $response->body()
            );
        }

        return $response->json() ?? [];
    }
}
