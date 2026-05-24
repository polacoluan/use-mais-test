<?php

namespace App\Http\Requests\Client;

use Illuminate\Validation\Rule;

class DestroyClientRequest extends ClientRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'client_id' => ['required', 'integer', Rule::exists('clients', 'id')->whereNull('deleted_at')],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'client_id' => $this->route('client'),
        ]);
    }
}
