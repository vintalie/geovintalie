<?php

namespace App\Scribe;

use Knuckles\Scribe\Extracting\Strategies\Strategy;
use Knuckles\Scribe\Tools\DocumentationConfig;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use App\Models\User;

class JwtAuthenticationStrategy extends Strategy
{
    public function __invoke(array $routeDetails, DocumentationConfig $config): ?array
    {
        // Busca um usuário existente para gerar o token
        // (Você pode usar o factory para criar um específico para os testes)
        $user = User::first(); 

        if (!$user) {
            // Se não houver usuário, crie um temporário (cuidado com o banco de dados)
            // $user = User::factory()->create(); // se usar factories
            return null; 
        }

        // Gera o token JWT para este usuário
        $token = JWTAuth::fromUser($user);
        dd($this);
        // Retorna o cabeçalho que será injetado em TODAS as requisições de exemplo
        return [
            'Authorization' => 'Bearer ' . $token,
        ];
    }
}