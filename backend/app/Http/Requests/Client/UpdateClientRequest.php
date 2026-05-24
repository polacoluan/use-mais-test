<?php

namespace App\Http\Requests\Client;

class UpdateClientRequest extends ClientRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $clientId = (int) $this->route('client');

        return [
            'client_id' => ['required', 'integer', $this->scopedClientExistsRule()],
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:150', $this->scopedUniqueEmailRule($clientId)],
            'postal_code' => ['required', 'string', 'size:8'],
            'street' => ['required', 'string', 'max:150'],
            'street_number' => ['required', 'string', 'max:20'],
            'complement' => ['nullable', 'string', 'max:100'],
            'neighborhood' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'size:2'],
        ];
    }

    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'client_id' => $this->route('client'),
        ]);
    }
}
