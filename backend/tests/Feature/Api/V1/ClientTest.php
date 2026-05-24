<?php

namespace Tests\Feature\Api\V1;

use App\Http\Middleware\AuthenticateClerk;
use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(AuthenticateClerk::class);
    }

    public function test_it_lists_all_clients(): void
    {
        $clients = Client::factory()->count(2)->create();

        $response = $this->getJson('/api/v1/clients');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $clients->sortBy('name')->values()->get(0)?->id)
            ->assertJsonPath('data.1.id', $clients->sortBy('name')->values()->get(1)?->id);
    }

    public function test_it_creates_a_client(): void
    {
        $payload = $this->validPayload();

        $response = $this->postJson('/api/v1/clients', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.name', $payload['name'])
            ->assertJsonPath('data.email', mb_strtolower($payload['email']))
            ->assertJsonPath('data.postal_code', '12345678')
            ->assertJsonPath('data.state', 'SP');

        $this->assertDatabaseHas('clients', [
            'email' => mb_strtolower($payload['email']),
            'postal_code' => '12345678',
            'state' => 'SP',
        ]);
    }

    public function test_it_validates_required_fields_when_creating_a_client(): void
    {
        $response = $this->postJson('/api/v1/clients', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'email',
                'postal_code',
                'street',
                'street_number',
                'neighborhood',
                'city',
                'state',
            ])
            ->assertJsonPath('errors.name.0', 'O campo nome é obrigatório.')
            ->assertJsonPath('errors.email.0', 'O campo e-mail é obrigatório.')
            ->assertJsonPath('errors.postal_code.0', 'O campo CEP é obrigatório.');
    }

    public function test_it_validates_field_formats_and_lengths_when_creating_a_client(): void
    {
        Client::factory()->create([
            'email' => 'cliente@example.com',
        ]);

        $payload = [
            'name' => str_repeat('a', 151),
            'email' => 'cliente@example.com',
            'postal_code' => '1234',
            'street' => str_repeat('b', 151),
            'street_number' => str_repeat('1', 21),
            'complement' => str_repeat('c', 101),
            'neighborhood' => str_repeat('d', 101),
            'city' => str_repeat('e', 101),
            'state' => 'Sao',
        ];

        $response = $this->postJson('/api/v1/clients', $payload);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'email',
                'postal_code',
                'street',
                'street_number',
                'complement',
                'neighborhood',
                'city',
                'state',
            ])
            ->assertJsonPath('errors.email.0', 'Já existe um cliente cadastrado com este e-mail.')
            ->assertJsonPath('errors.postal_code.0', 'O campo CEP deve ter 8 caracteres.')
            ->assertJsonPath('errors.state.0', 'O campo UF deve ter 2 caracteres.');
    }

    public function test_it_updates_a_client(): void
    {
        $client = Client::factory()->create();
        $payload = $this->validPayload([
            'name' => 'Cliente Atualizado',
            'email' => 'novoemail@example.com',
            'postal_code' => '87654-321',
            'state' => 'rj',
        ]);

        $response = $this->putJson("/api/v1/clients/{$client->id}", $payload);

        $response->assertOk()
            ->assertJsonPath('data.id', $client->id)
            ->assertJsonPath('data.name', 'Cliente Atualizado')
            ->assertJsonPath('data.email', 'novoemail@example.com')
            ->assertJsonPath('data.postal_code', '87654321')
            ->assertJsonPath('data.state', 'RJ');

        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'name' => 'Cliente Atualizado',
            'email' => 'novoemail@example.com',
            'postal_code' => '87654321',
            'state' => 'RJ',
        ]);
    }

    public function test_it_validates_that_the_client_exists_when_updating(): void
    {
        $response = $this->putJson('/api/v1/clients/999999', $this->validPayload());

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['client_id'])
            ->assertJsonPath('errors.client_id.0', 'O cliente informado não foi encontrado.');
    }

    public function test_it_deletes_a_client(): void
    {
        $client = Client::factory()->create();

        $response = $this->deleteJson("/api/v1/clients/{$client->id}");

        $response->assertOk()
            ->assertJson([
                'message' => 'Cliente removido com sucesso.',
            ]);

        $this->assertSoftDeleted('clients', [
            'id' => $client->id,
        ]);
    }

    public function test_it_validates_that_the_client_exists_when_deleting(): void
    {
        $response = $this->deleteJson('/api/v1/clients/999999');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['client_id'])
            ->assertJsonPath('errors.client_id.0', 'O cliente informado não foi encontrado.');
    }

    public function test_it_does_not_list_soft_deleted_clients(): void
    {
        $visibleClient = Client::factory()->create([
            'name' => 'Cliente Visível',
        ]);
        $deletedClient = Client::factory()->create([
            'name' => 'Cliente Removido',
        ]);

        $deletedClient->delete();

        $response = $this->getJson('/api/v1/clients');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visibleClient->id);
    }

    public function test_it_allows_creating_a_client_with_the_same_email_of_a_soft_deleted_client(): void
    {
        $client = Client::factory()->create([
            'email' => 'cliente@example.com',
        ]);

        $this->deleteJson("/api/v1/clients/{$client->id}")
            ->assertOk();

        $response = $this->postJson('/api/v1/clients', $this->validPayload());

        $response->assertCreated()
            ->assertJsonPath('data.email', 'cliente@example.com');

        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'deleted_at' => $client->fresh()?->deleted_at,
        ]);
        $this->assertDatabaseHas('clients', [
            'email' => 'cliente@example.com',
            'deleted_at' => null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Cliente Teste',
            'email' => 'cliente@example.com',
            'postal_code' => '12345-678',
            'street' => 'Rua das Flores',
            'street_number' => '123A',
            'complement' => 'Sala 01',
            'neighborhood' => 'Centro',
            'city' => 'São Paulo',
            'state' => 'sp',
        ], $overrides);
    }
}
