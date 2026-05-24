<?php

namespace App\Http\Requests\Client;

class ListClientsRequest extends ClientRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'page.min' => 'O campo :attribute deve ser no mínimo :min.',
            'per_page.min' => 'O campo :attribute deve ser no mínimo :min.',
            'per_page.max' => 'O campo :attribute deve ser no máximo :max.',
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return array_merge(parent::attributes(), [
            'page' => 'página',
            'per_page' => 'quantidade por página',
        ]);
    }
}
