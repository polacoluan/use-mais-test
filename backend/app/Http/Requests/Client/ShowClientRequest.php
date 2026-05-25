<?php

namespace App\Http\Requests\Client;

class ShowClientRequest extends ClientRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'client_id' => ['required', 'integer', $this->scopedClientExistsRule()],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'client_id' => $this->route('client'),
        ]);
    }
}
