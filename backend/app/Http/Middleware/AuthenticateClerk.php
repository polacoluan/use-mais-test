<?php

namespace App\Http\Middleware;

use App\Services\Clerk\ClerkTokenVerifier;
use App\Services\Clerk\ClerkUserSynchronizer;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuthenticateClerk
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function __construct(
        public ClerkTokenVerifier $tokenVerifier,
        public ClerkUserSynchronizer $userSynchronizer,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        try {
            $claims = $this->tokenVerifier->verifyRequest($request);
            $user = $this->userSynchronizer->synchronize($claims);

            $request->attributes->set('clerk_auth', $claims);
            $request->setUserResolver(static fn () => $user);

            Auth::guard('web')->setUser($user);
        } catch (Throwable) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return $next($request);
    }
}
