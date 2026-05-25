<?php

namespace App\Http\Requests\Client;

class StoreClientRequest extends ClientRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return $this->clientRules();
    }

    /**
     * @return array<string, mixed>
     */
    private function clientRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:150', $this->scopedUniqueEmailRule()],
            'postal_code' => ['required', 'string', 'size:8'],
            'street' => ['required', 'string', 'max:150'],
            'street_number' => ['required', 'string', 'max:10'],
            'complement' => ['nullable', 'string', 'max:100'],
            'neighborhood' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'size:2'],
        ];
    }
}
