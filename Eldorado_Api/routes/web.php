<?php

use Illuminate\Support\Facades\Route;
use App\Http\Middleware\CheckUserStatus;

Route::get('/', function () {
    return view('welcome');
});

