<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\DestroyClientRequest;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Services\ClientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    public function __construct(
        private readonly ClientService $service,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return ClientResource::collection($this->service->list());
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = $this->service->create($request->validated());

        return ClientResource::make($client)
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateClientRequest $request, int $client): ClientResource
    {
        return ClientResource::make(
            $this->service->update($client, $request->validated())
        );
    }

    public function destroy(DestroyClientRequest $request, int $client): JsonResponse
    {
        $this->service->delete($client);

        return response()->json([
            'message' => 'Cliente removido com sucesso.',
        ]);
    }
}
