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
use App\Http\Controllers\SearchController;

use Illuminate\Support\Facades\Route;


Route::group([

    'middleware' => ['jwt.auth', 'role:admin,user,public'],
    'prefix' => 'auth'

], function($router) {
    ##login
    ##usuario



    Route::apiResource('products.stocks', StockController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('user', UserController::class);

    Route::post('2fa-register', RegisterController::class . '@twofa');    
    Route::post('logout',AuthController::class . '@logout');
    Route::post('refresh',AuthController::class . '@refresh');
    Route::post('me', AuthController::class . '@me');


}); 

    Route::group([

        'prefix' => 'auth/location',
        'middleware' => ['jwt.auth', 'role:admin,user,public'],
        
    ], function($router) {
        Route::apiResource('countries.states.cities.streets', StateController::class);
        
        Route::apiResource('states', StateController::class);
        Route::apiResource('streets', StreetController::class);
        Route::apiResource('states', StateController::class);
        Route::apiResource('cities', CityController::class);
        Route::apiResource('countries', CountryController::class);
        Route::apiResource('neighborhoods', NeighborhoodController::class);
    });

    //não protegidas
    Route::post('login',AuthController::class . '@login');
    #registro de usuario e confirmação de conta/2FA
    Route::post('register', RegisterController::class . '@register');    
    Route::post('verify-email', RegisterController::class . '@verify_email');    
    
    Route::group([

        'prefix' => 'auth',
        'middleware' => ['jwt.auth', 'role:admin'],
        
    ], function($router) {
        
        Route::apiResource('user', UserController::class);
    
    });



Route::get('s', SearchController::class . '@search');