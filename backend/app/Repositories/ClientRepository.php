<?php

namespace App\Repositories;

use App\Models\Client;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ClientRepository
{
    public function paginate(int $userId, int $page, int $perPage): LengthAwarePaginator
    {
        return Client::query()
            ->where('user_id', $userId)
            ->orderBy('name')
            ->orderBy('id')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function create(array $data): Client
    {
        /** @var Client $client */
        $client = Client::query()->create($data);

        return $client->fresh();
    }

    public function findOrFail(int $userId, int $clientId): Client
    {
        /** @var Client $client */
        $client = Client::query()
            ->where('user_id', $userId)
            ->findOrFail($clientId);

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
