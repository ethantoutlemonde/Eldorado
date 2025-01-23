<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\CheckUserStatus;
use App\Http\Controllers\UserController;

Route::middleware(['auth:api', CheckUserStatus::class])->get('/casino', function () {
    return response()->json(['message' => 'Bienvenue dans le casino !']);
});

Route::apiResource('users', UserController::class);


