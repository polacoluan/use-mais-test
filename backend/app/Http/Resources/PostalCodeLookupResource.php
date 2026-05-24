<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostalCodeLookupResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'postal_code' => $this['postal_code'],
            'street' => $this['street'],
            'complement' => $this['complement'],
            'neighborhood' => $this['neighborhood'],
            'city' => $this['city'],
            'state' => $this['state'],
        ];
    }
}
