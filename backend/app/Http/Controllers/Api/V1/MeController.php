<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): UserResource
    {
        /** @var array<string, mixed> $clerkAuth */
        $clerkAuth = $request->attributes->get('clerk_auth', []);

        return UserResource::make($request->user())->additional([
            'meta' => [
                'clerk' => [
                    'user_id' => $clerkAuth['sub'] ?? null,
                    'session_id' => $clerkAuth['sid'] ?? null,
                ],
            ],
        ]);
    }
}
