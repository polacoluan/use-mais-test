<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('authenticated-api', function (Request $request): Limit {
            return Limit::perMinute((int) config('api.rate_limits.authenticated.per_minute', 60))
                ->by($this->rateLimitKey($request))
                ->response(function (): \Illuminate\Http\JsonResponse {
                    return response()->json([
                        'message' => 'Muitas solicitações foram realizadas. Tente novamente em instantes.',
                    ], 429);
                });
        });

        RateLimiter::for('postal-code-lookups', function (Request $request): Limit {
            return Limit::perMinute((int) config('api.rate_limits.postal_code_lookups.per_minute', 30))
                ->by('postal-code:'.$this->rateLimitKey($request))
                ->response(function (): \Illuminate\Http\JsonResponse {
                    return response()->json([
                        'message' => 'Muitas consultas de CEP foram realizadas. Tente novamente em instantes.',
                    ], 429);
                });
        });
    }

    private function rateLimitKey(Request $request): string
    {
        $userId = $request->user()?->getAuthIdentifier();

        if ($userId !== null) {
            return 'user:'.$userId;
        }

        return 'ip:'.$request->ip();
    }
}
