<?php

namespace App\Services;

use App\Models\Client;
use App\Repositories\ClientRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\QueryException;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ClientService
{
    public function __construct(
        private readonly ClientRepository $clients,
    ) {}

    public function list(int $userId, int $page, int $perPage): LengthAwarePaginator
    {
        return $this->clients->paginate($userId, $page, $perPage);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(int $userId, array $data): Client
    {
        try {
            return $this->clients->create($this->payload($userId, $data));
        } catch (QueryException $exception) {
            $this->throwIfDuplicateEmail($exception);

            throw $exception;
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $userId, int $clientId, array $data): Client
    {
        $client = $this->clients->findOrFail($userId, $clientId);

        try {
            return $this->clients->update($client, $this->payload($userId, $data));
        } catch (QueryException $exception) {
            $this->throwIfDuplicateEmail($exception);

            throw $exception;
        }
    }

    public function delete(int $userId, int $clientId): void
    {
        $client = $this->clients->findOrFail($userId, $clientId);
        $client->email = $this->deletedEmail($client);

        $this->clients->delete($client);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function payload(int $userId, array $data): array
    {
        return [
            'user_id' => $userId,
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

    private function throwIfDuplicateEmail(QueryException $exception): void
    {
        if (! $this->isUniqueConstraintViolation($exception)) {
            return;
        }

        throw ValidationException::withMessages([
            'email' => ['Já existe um cliente cadastrado com este e-mail.'],
        ]);
    }

    private function isUniqueConstraintViolation(QueryException $exception): bool
    {
        $sqlState = $exception->errorInfo[0] ?? null;
        $driverCode = $exception->errorInfo[1] ?? null;

        return $sqlState === '23505'
            || ($sqlState === '23000' && in_array($driverCode, [19, 1062], true));
    }
}
