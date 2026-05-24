<?php

namespace App\Http\Requests\Client;

use Illuminate\Validation\Rule;

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
            'email' => ['required', 'string', 'email', 'max:150', Rule::unique('clients', 'email')->whereNull('deleted_at')],
            'postal_code' => ['required', 'string', 'size:8'],
            'street' => ['required', 'string', 'max:150'],
            'street_number' => ['required', 'string', 'max:20'],
            'complement' => ['nullable', 'string', 'max:100'],
            'neighborhood' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'size:2'],
        ];
    }
}
