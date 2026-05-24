<?php

namespace App\Repositories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ClientRepository
{
    /**
     * @return Collection<int, Client>
     */
    public function getAll(): Collection
    {
        return Client::query()
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): Client
    {
        /** @var Client $client */
        $client = Client::query()->create($data);

        return $client->fresh();
    }

    public function findOrFail(int $clientId): Client
    {
        /** @var Client $client */
        $client = Client::query()->findOrFail($clientId);

        return $client;
    }

    public function update(Client $client, array $data): Client
    {
        $client->fill($data);
        $client->save();

        /** @var Client $freshClient */
        $freshClient = $client->fresh();

        return $freshClient;
    }

    public function delete(Client $client): void
    {
        DB::transaction(function () use ($client): void {
            $client->save();
            $client->delete();
        });
    }
}
