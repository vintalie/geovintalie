<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Google Business Profile - Credenciais OAuth 2.0
    |--------------------------------------------------------------------------
    |
    | Credenciais obtidas no Google Cloud Console (arquivo client_secret_*.json
    | baixado pelo usuario) e injetadas via variaveis de ambiente.
    */

    'client_id'     => env('GOOGLE_BUSINESS_CLIENT_ID'),
    'client_secret' => env('GOOGLE_BUSINESS_CLIENT_SECRET'),
    'redirect_uri'  => env('GOOGLE_BUSINESS_REDIRECT_URI'),

    /**
     * URL para onde o usuário é redirecionado após o callback do OAuth.
     * Quando não definida, o callback retorna JSON (modo API puro).
     */
    'frontend_redirect_uri' => env('GOOGLE_BUSINESS_FRONTEND_REDIRECT_URI'),

    'auth_uri' => env('GOOGLE_BUSINESS_AUTH_URI', 'https://accounts.google.com/o/oauth2/v2/auth'),
    'token_uri' => env('GOOGLE_BUSINESS_TOKEN_URI', 'https://oauth2.googleapis.com/token'),

    /*
    |--------------------------------------------------------------------------
    | Escopos da Google Business Profile API (My Business Information API)
    |--------------------------------------------------------------------------
    |
    * business.manage: leitura/gerenciamento de contas e locais do perfil empresarial.
    */
    'scopes' => [
        'https://www.googleapis.com/auth/business.manage',
    ],

    'base_url' => 'https://mybusinessbusinessinformation.googleapis.com/v1',

];
