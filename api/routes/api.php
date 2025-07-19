<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\DocumentController;

Route::apiResource('users', UserController::class);

Route::middleware('cors')->group(function () {
    Route::get('/idCards/{id}', [DocumentController::class, 'show']);
    // Autres routes qui ont besoin de CORS
});

