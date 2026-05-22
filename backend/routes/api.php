<?php

use App\Http\Controllers\Api\V1\MeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/me', MeController::class)
        ->middleware('clerk.auth')
        ->name('api.v1.me');
});
