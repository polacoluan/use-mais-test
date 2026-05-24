<?php

namespace App\Services;

use App\Models\Client;
use App\Repositories\ClientRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class ClientService
{
    public function __construct(
        private readonly ClientRepository $clients,
    ) {}

    /**
     * @return Collection<int, Client>
     */
    public function list(): Collection
    {
        return $this->clients->getAll();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Client
    {
        return $this->clients->create($this->payload($data));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $clientId, array $data): Client
    {
        $client = $this->clients->findOrFail($clientId);

        return $this->clients->update($client, $this->payload($data));
    }

    public function delete(int $clientId): void
    {
        $client = $this->clients->findOrFail($clientId);
        $client->email = $this->deletedEmail($client);

        $this->clients->delete($client);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function payload(array $data): array
    {
        return [
            'name' => $data['name'],
            'email' => $data['email'],
            'postal_code' => $data['postal_code'],
            'street' => $data['street'],
            'street_number' => $data['street_number'],
            'complement' => $data['complement'] ?? null,
            'neighborhood' => $data['neighborhood'],
            'city' => $data['city'],
            'state' => $data['state'],
        ];
    }

    private function deletedEmail(Client $client): string
    {
        $suffix = sprintf('__deleted__%d', $client->id);
        $availableLength = 150 - mb_strlen($suffix);
        $baseEmail = mb_substr($client->email, 0, max($availableLength, 0));

        return Str::lower($baseEmail.$suffix);
    }
}
