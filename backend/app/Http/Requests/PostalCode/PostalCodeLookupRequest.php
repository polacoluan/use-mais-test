<?php

namespace App\Http\Requests\PostalCode;

use Illuminate\Foundation\Http\FormRequest;

class PostalCodeLookupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'postal_code' => ['required', 'string', 'size:8'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'string' => 'O campo :attribute deve ser um texto.',
            'size' => 'O campo :attribute deve ter :size caracteres.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'postal_code' => 'CEP',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'postal_code' => is_string($this->route('postal_code'))
                ? preg_replace('/\D+/', '', $this->route('postal_code'))
                : $this->route('postal_code'),
        ]);
    }
}
