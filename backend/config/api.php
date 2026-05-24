<?php

return [
    'rate_limits' => [
        'authenticated' => [
            'per_minute' => (int) env('API_AUTHENTICATED_RATE_LIMIT', 60),
        ],
        'postal_code_lookups' => [
            'per_minute' => (int) env('API_POSTAL_CODE_RATE_LIMIT', 30),
        ],
    ],
];
