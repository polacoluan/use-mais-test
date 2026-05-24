<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PostalCode\PostalCodeLookupRequest;
use App\Http\Resources\PostalCodeLookupResource;
use App\Services\Address\ViaCepService;

class PostalCodeLookupController extends Controller
{
    public function __construct(
        private readonly ViaCepService $viaCep,
    ) {}

    public function show(PostalCodeLookupRequest $request): PostalCodeLookupResource
    {
        return PostalCodeLookupResource::make(
            $this->viaCep->lookup($request->validated('postal_code'))
        );
    }
}
