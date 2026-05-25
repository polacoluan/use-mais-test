<?php

namespace App\Services\Address;

use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ViaCepService
{
    /**
     * @return array<string, string|null>
     */
    public function lookup(string $postalCode): array
    {
        $response = Http::baseUrl((string) config('services.via_cep.base_url'))
            ->acceptJson()
            ->timeout((int) config('services.via_cep.timeout', 5))
            ->get('/ws/'.$postalCode.'/json/');

        if ($response->failed()) {
            throw new HttpException(
                502,
                'Não foi possível consultar o CEP informado no momento.',
            );
        }

        /** @var array<string, mixed> $data */
        $data = $response->json();

        if (($data['erro'] ?? false) === true) {
            throw new NotFoundHttpException('O CEP informado não foi encontrado.');
        }

        $postalCodeData = [
            'postal_code' => (string) ($data['cep'] ?? ''),
            'street' => (string) ($data['logradouro'] ?? ''),
            'complement' => $this->nullableString($data['complemento'] ?? null),
            'neighborhood' => (string) ($data['bairro'] ?? ''),
            'city' => (string) ($data['localidade'] ?? ''),
            'state' => (string) ($data['uf'] ?? ''),
        ];

        if (! $this->hasRequiredAddressData($postalCodeData)) {
            throw new NotFoundHttpException('O CEP informado é inválido ou não foi encontrado.');
        }

        return $postalCodeData;
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmedValue = trim($value);

        return $trimmedValue === '' ? null : $trimmedValue;
    }

    /**
     * @param  array<string, string|null>  $postalCodeData
     */
    private function hasRequiredAddressData(array $postalCodeData): bool
    {
        return $this->hasValue($postalCodeData['postal_code'] ?? null)
            && $this->hasValue($postalCodeData['street'] ?? null)
            && $this->hasValue($postalCodeData['neighborhood'] ?? null)
            && $this->hasValue($postalCodeData['city'] ?? null)
            && $this->hasValue($postalCodeData['state'] ?? null);
    }

    private function hasValue(?string $value): bool
    {
        return is_string($value) && trim($value) !== '';
    }
}
