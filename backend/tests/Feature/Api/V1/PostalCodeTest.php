<?php

namespace Tests\Feature\Api\V1;

use App\Http\Middleware\AuthenticateClerk;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PostalCodeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(AuthenticateClerk::class);
    }

    public function test_it_returns_the_postal_code_data_used_by_the_client_model(): void
    {
        Http::fake([
            'https://viacep.com.br/ws/01001000/json/' => Http::response([
                'cep' => '01001-000',
                'logradouro' => 'Praça da Sé',
                'complemento' => 'lado ímpar',
                'unidade' => '',
                'bairro' => 'Sé',
                'localidade' => 'São Paulo',
                'uf' => 'SP',
                'estado' => 'São Paulo',
                'regiao' => 'Sudeste',
                'ibge' => '3550308',
                'gia' => '1004',
                'ddd' => '11',
                'siafi' => '7107',
            ]),
        ]);

        $response = $this->getJson('/api/v1/postal-codes/01001-000');

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'postal_code' => '01001-000',
                    'street' => 'Praça da Sé',
                    'complement' => 'lado ímpar',
                    'neighborhood' => 'Sé',
                    'city' => 'São Paulo',
                    'state' => 'SP',
                ],
            ])
            ->assertJsonMissingPath('data.street_number')
            ->assertJsonMissingPath('data.name')
            ->assertJsonMissingPath('data.email');
    }

    public function test_it_validates_the_postal_code_format(): void
    {
        $response = $this->getJson('/api/v1/postal-codes/1234');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['postal_code'])
            ->assertJsonPath('errors.postal_code.0', 'O campo CEP deve ter 8 caracteres.');
    }

    public function test_it_returns_not_found_when_the_postal_code_does_not_exist(): void
    {
        Http::fake([
            'https://viacep.com.br/ws/99999999/json/' => Http::response([
                'erro' => true,
            ]),
        ]);

        $response = $this->getJson('/api/v1/postal-codes/99999-999');

        $response->assertNotFound()
            ->assertJson([
                'message' => 'O CEP informado não foi encontrado.',
            ]);
    }

    public function test_it_returns_not_found_when_the_external_service_returns_an_empty_address(): void
    {
        Http::fake([
            'https://viacep.com.br/ws/81270170/json/' => Http::response([
                'cep' => '',
                'logradouro' => '',
                'complemento' => null,
                'bairro' => '',
                'localidade' => '',
                'uf' => '',
            ]),
        ]);

        $response = $this->getJson('/api/v1/postal-codes/81270170');

        $response->assertNotFound()
            ->assertJson([
                'message' => 'O CEP informado é inválido ou não foi encontrado.',
            ]);
    }

    public function test_it_returns_a_friendly_message_when_the_external_service_is_unavailable(): void
    {
        Http::fake([
            'https://viacep.com.br/ws/01001000/json/' => Http::response([], 500),
        ]);

        $response = $this->getJson('/api/v1/postal-codes/01001000');

        $response->assertStatus(502)
            ->assertJson([
                'message' => 'Não foi possível consultar o CEP informado no momento.',
            ]);
    }
}
