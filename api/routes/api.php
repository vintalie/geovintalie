<?php

use Illuminate\Http\Request;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\StateController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\NeighborhoodController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StreetController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ServiceProviderController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\ServiceListingController;
use App\Http\Controllers\ServiceEvaluationController;
use App\Http\Controllers\ProductLocatorController;
use App\Http\Controllers\FeatureFlagController;
use App\Http\Controllers\GoogleBusinessController;
use App\Http\Controllers\ServiceSearchController;
use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ConversationsController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\PublicPropertyController;
use App\Http\Controllers\UserConsentController;

use Illuminate\Support\Facades\Route;

Route::group([
    'middleware' => ['jwt.auth', 'role:admin,user,public'],
    'prefix' => 'auth'
], function($router) {
    Route::apiResource('products.stocks', StockController::class);
    Route::apiResource('properties', PropertyController::class);
    Route::apiResource('products', ProductController::class);
    // Produtos de uma propriedade (clique na propriedade mostra os produtos da loja)
    Route::get('properties/{property}/products', [ProductController::class, 'byProperty']);
    Route::apiResource('user', UserController::class);

    Route::post('2fa-register', RegisterController::class . '@twofa');
    Route::post('logout', AuthController::class . '@logout');
    Route::post('refresh', AuthController::class . '@refresh');
    Route::post('me', AuthController::class . '@me');
});

Route::group([
    'prefix' => 'auth/location',
    'middleware' => ['jwt.auth', 'role:admin,user,public'],
], function($router) {
    Route::apiResource('countries.states.cities.streets', StateController::class);
    Route::apiResource('countries.states', StateController::class);
    Route::apiResource('states.countries', StateController::class);
    Route::apiResource('countries.states.cities', CityController::class);
    Route::apiResource('states', StateController::class);
    Route::apiResource('streets', StreetController::class);
    Route::apiResource('cities', CityController::class);
    Route::apiResource('countries', CountryController::class);
    Route::apiResource('neighborhoods', NeighborhoodController::class);
});

// não protegidas
Route::post('login', AuthController::class . '@login');
Route::post('register', RegisterController::class . '@register');
Route::post('verify-email', RegisterController::class . '@verify_email');

Route::get('s', SearchController::class . '@search');

// ============================================================================
// API v2 - Novos endpoints para escopos A, B, C (R1)
// ============================================================================
Route::prefix('v2')->group(function () {
    // Auth - dados do usuario autenticado
    Route::middleware(['jwt.auth'])->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);

        // Usuarios - apenas admin
        Route::middleware(['role:admin'])->group(function () {
            Route::get('auth/users', [UserController::class, 'index']);
            Route::get('auth/users/{id}', [UserController::class, 'show']);
        });

        // Feature Flags
        Route::get('feature-flags', [FeatureFlagController::class, 'index']);
        Route::middleware(['role:admin'])->group(function () {
            Route::patch('feature-flags/{name}', [FeatureFlagController::class, 'update']);
        });

        // Service Providers (Escopo B1)
        Route::get('service-providers', [ServiceProviderController::class, 'index']);
        Route::post('service-providers', [ServiceProviderController::class, 'store']);
        Route::get('service-providers/{id}', [ServiceProviderController::class, 'show']);
        Route::put('service-providers/{id}', [ServiceProviderController::class, 'update']);

        // Service Listings (Escopo B1, B2)
        Route::get('service-listings', [ServiceListingController::class, 'index']);
        Route::post('service-listings', [ServiceListingController::class, 'store']);
        Route::get('service-listings/{id}', [ServiceListingController::class, 'show']);

        // Avaliacoes mutuas cliente-prestador (Escopo B5)
        Route::middleware(['jwt.auth'])->group(function () {
            Route::post('service-evaluations', [ServiceEvaluationController::class, 'store']);
        });

        // Listar avaliacoes recebidas por um prestador (publico, Escopo B5)
        Route::get('service-providers/{provider_id}/evaluations', [ServiceEvaluationController::class, 'byProvider']);

        // Avaliacoes mutuas (Escopo B5) - ff_reviews
        Route::post('reviews', [ReviewController::class, 'store']);
        Route::get('reviews', [ReviewController::class, 'index']);

        // ============================================================================
        // Escopo B4 - Agendamentos e Chat Interno
        // ============================================================================

        // Agendamentos (cliente cria; prestador atualiza status) - implementacao unificada em AppointmentsController
        Route::get('appointments', [AppointmentsController::class, 'index']);
        Route::post('appointments', [AppointmentsController::class, 'store']);
        Route::get('appointments/{appointment}', [AppointmentsController::class, 'show']);
        Route::put('appointments/{appointment}', [AppointmentsController::class, 'update']);
        Route::delete('appointments/{appointment}', [AppointmentsController::class, 'destroy']);

        // Conversas e mensagens de chat interno (cliente <-> prestador) - Escopo B4 (ff_chat) - implementacao unificada em ConversationsController/MessagesController
        Route::get('conversations', [ConversationsController::class, 'index']);
        Route::post('conversations', [ConversationsController::class, 'store']);
        Route::get('conversations/{conversation}', [ConversationsController::class, 'show']);
        Route::post('conversations/{conversation}/messages', [MessagesController::class, 'store']);
        Route::get('messages', [MessagesController::class, 'index']);
        Route::post('messages/{message}/read', [MessagesController::class, 'markRead']);

        // Agendamentos e Chat Interno (Escopo B4) - autenticado
        Route::get('agendamentos', [AppointmentsController::class, 'index']);
        Route::post('agendamentos', [AppointmentsController::class, 'store']);
        Route::get('agendamentos/{appointment}', [AppointmentsController::class, 'show']);
        Route::patch('agendamentos/{appointment}', [AppointmentsController::class, 'update']);
        Route::delete('agendamentos/{appointment}', [AppointmentsController::class, 'destroy']);

        // Conversas (Escopo B4)
        Route::get('conversas', [ConversationsController::class, 'index']);
        Route::post('conversas', [ConversationsController::class, 'store']);
        Route::post('conversas/open', [ConversationsController::class, 'open']);
        Route::get('conversas/{conversation}', [ConversationsController::class, 'show']);

        // Mensagens (Escopo B4)
        Route::get('conversas/{conversation}/mensagens', [MessagesController::class, 'index']);
        Route::post('conversas/{conversation}/mensagens', [MessagesController::class, 'store']);
    });

    // Service Categories - publico (Escopo B1, B2)
    Route::get('service-categories', [ServiceCategoryController::class, 'index']);

    // Product Locator - autenticado (Escopo A1)
    Route::middleware(['jwt.auth'])->group(function () {
        Route::get('product-locator', [ProductLocatorController::class, 'index']);
    });

    // Service Search - publico (Escopo B2)
    Route::get('service-search', [ServiceSearchController::class, 'index']);

    // Listagem publica de avaliacoes (reviews) de um prestador (Escopo B5)
    Route::get('service-providers/{provider_id}/reviews', [ReviewController::class, 'byProvider']);

    // User Consent - LGPD (Escopo C3) - autenticado
    Route::middleware(['jwt.auth'])->group(function () {
        Route::get('user-consents', [UserConsentController::class, 'index']);
        Route::post('user-consents', [UserConsentController::class, 'store']);
        // Rota estatica deve vir ANTES da parametrizada {purpose}, senao
        // 'account' e consumido como valor de purpose e o deleteAccount nunca e alcançado.
        Route::delete('user-consents/account', [UserConsentController::class, 'deleteAccount']);
        Route::delete('user-consents/{purpose}', [UserConsentController::class, 'destroy']);
        Route::get('user-consents/export', [UserConsentController::class, 'export']);
    });

    // Google Business Profile (Escopo A2) - fluxo OAuth 2.0
    // o callback é chamado pelo navegador do usuario apos o consentimento no Google
    // e identifica o usuario pelo parametro state assinado (nao exige JWT).
    Route::get('google-business/callback', [GoogleBusinessController::class, 'callback']);

    // Autorizacao OAuth: exige JWT para saber qual usuario esta conectando a conta.
    Route::middleware(['jwt.auth'])->group(function () {
        Route::get('google-business/redirect', [GoogleBusinessController::class, 'authorize']);
    });

    Route::middleware(['jwt.auth', 'feature.flag:ff_o2o_locator'])->group(function () {
        Route::get('google-business/accounts', [GoogleBusinessController::class, 'accounts']);
        Route::get('google-business/accounts/{account}/locations', [GoogleBusinessController::class, 'locations']);
        Route::get('google-business/accounts/{account}/locations/{location}', [GoogleBusinessController::class, 'sync']);
        Route::delete('google-business/disconnect', [GoogleBusinessController::class, 'disconnect']);
    });

    // Public Properties - Vitrine digital pública (Escopo A3) - sem autenticação
    Route::prefix('public')->group(function () {
        Route::get('properties', [PublicPropertyController::class, 'index']);
        Route::get('properties/{property}', [PublicPropertyController::class, 'show']);
    });

    // ============================================================================
    // Observabilidade (Escopo C2)
    // ============================================================================
    Route::get('health', \App\Http\Controllers\Observability\HealthController::class)->name('health');
    Route::get('metrics', \App\Http\Controllers\Observability\MetricsController::class)->name('metrics');
});

