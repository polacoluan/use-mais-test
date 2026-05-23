<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'clerk' => [
        'secret_key' => env('CLERK_SECRET_KEY'),
        'publishable_key' => env('CLERK_PUBLISHABLE_KEY', env('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')),
        'jwt_key' => env('CLERK_JWT_KEY'),
        'jwks_url' => env('CLERK_JWKS_URL', 'https://api.clerk.com/v1/jwks'),
        'backend_api_url' => env('CLERK_BACKEND_API_URL', 'https://api.clerk.com'),
        'authorized_parties' => array_values(array_filter(array_map(
            static fn (string $origin): string => trim($origin),
            explode(',', (string) env('CLERK_AUTHORIZED_PARTIES', 'http://localhost:3000,http://127.0.0.1:3000'))
        ))),
        'clock_skew' => (int) env('CLERK_CLOCK_SKEW', 5),
    ],

];
