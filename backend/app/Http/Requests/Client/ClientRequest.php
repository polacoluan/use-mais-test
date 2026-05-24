<?php

namespace App\Http\Requests\Client;

use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'string' => 'O campo :attribute deve ser um texto.',
            'email' => 'O campo :attribute deve ser um endereço de e-mail válido.',
            'max' => 'O campo :attribute deve ter no máximo :max caracteres.',
            'size' => 'O campo :attribute deve ter :size caracteres.',
            'unique' => 'Já existe um cliente cadastrado com este :attribute.',
            'exists' => 'O cliente informado não foi encontrado.',
            'integer' => 'O campo :attribute deve ser um número inteiro.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'client_id' => 'cliente',
            'name' => 'nome',
            'email' => 'e-mail',
            'postal_code' => 'CEP',
            'street' => 'logradouro',
            'street_number' => 'número',
            'complement' => 'complemento',
            'neighborhood' => 'bairro',
            'city' => 'cidade',
            'state' => 'UF',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => is_string($this->input('email')) ? mb_strtolower(trim($this->input('email'))) : $this->input('email'),
            'postal_code' => is_string($this->input('postal_code')) ? preg_replace('/\D+/', '', $this->input('postal_code')) : $this->input('postal_code'),
            'state' => is_string($this->input('state')) ? mb_strtoupper(trim($this->input('state'))) : $this->input('state'),
            'name' => is_string($this->input('name')) ? trim($this->input('name')) : $this->input('name'),
            'street' => is_string($this->input('street')) ? trim($this->input('street')) : $this->input('street'),
            'street_number' => is_string($this->input('street_number')) ? trim($this->input('street_number')) : $this->input('street_number'),
            'complement' => is_string($this->input('complement')) ? trim($this->input('complement')) : $this->input('complement'),
            'neighborhood' => is_string($this->input('neighborhood')) ? trim($this->input('neighborhood')) : $this->input('neighborhood'),
            'city' => is_string($this->input('city')) ? trim($this->input('city')) : $this->input('city'),
        ]);
    }

    protected function authenticatedUserId(): int
    {
        return (int) $this->user()?->getAuthIdentifier();
    }

    protected function scopedClientExistsRule()
    {
        return Rule::exists('clients', 'id')
            ->where(function (Builder $query): void {
                $query
                    ->where('user_id', $this->authenticatedUserId())
                    ->whereNull('deleted_at');
            });
    }

    protected function scopedUniqueEmailRule(?int $ignoredClientId = null)
    {
        $rule = Rule::unique('clients', 'email')
            ->where(function (Builder $query): void {
                $query
                    ->where('user_id', $this->authenticatedUserId())
                    ->whereNull('deleted_at');
            });

        if ($ignoredClientId !== null) {
            $rule->ignore($ignoredClientId);
        }

        return $rule;
    }
}
