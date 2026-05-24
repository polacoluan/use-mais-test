<?php

use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\PostalCodeLookupController;
use Illuminate\Support\Facades\Route;

Route::middleware('clerk.auth')
    ->prefix('v1')
    ->group(function (): void {
        Route::get('/postal-codes/{postal_code}', [PostalCodeLookupController::class, 'show'])
            ->name('api.v1.postal-codes.show');
        Route::get('/clients', [ClientController::class, 'index'])
            ->name('api.v1.clients.index');
        Route::post('/clients', [ClientController::class, 'store'])
            ->name('api.v1.clients.store');
        Route::put('/clients/{client}', [ClientController::class, 'update'])
            ->whereNumber('client')
            ->name('api.v1.clients.update');
        Route::delete('/clients/{client}', [ClientController::class, 'destroy'])
            ->whereNumber('client')
            ->name('api.v1.clients.destroy');
    });
