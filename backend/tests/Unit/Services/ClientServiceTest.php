<?php

namespace Tests\Unit\Services;

use App\Repositories\ClientRepository;
use App\Services\ClientService;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Mockery;
use PDOException;
use Tests\TestCase;

class ClientServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_it_converts_duplicate_key_errors_into_a_validation_exception_when_creating(): void
    {
        $repository = Mockery::mock(ClientRepository::class);
        $repository->shouldReceive('create')
            ->once()
            ->andThrow($this->duplicateKeyException());

        $service = new ClientService($repository);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Já existe um cliente cadastrado com este e-mail.');

        $service->create(1, [
            'name' => 'Cliente Teste',
            'email' => 'cliente@example.com',
            'postal_code' => '12345678',
            'street' => 'Rua das Flores',
            'street_number' => '123',
            'complement' => null,
            'neighborhood' => 'Centro',
            'city' => 'São Paulo',
            'state' => 'SP',
        ]);
    }

    private function duplicateKeyException(): QueryException
    {
        $previous = new PDOException('Duplicate entry', '23000');
        $previous->errorInfo = ['23000', 1062, 'Duplicate entry'];

        return new QueryException(
            'mysql',
            'insert into `clients` (`user_id`, `email`) values (?, ?)',
            [],
            $previous,
        );
    }
}
