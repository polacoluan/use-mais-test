<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\DestroyClientRequest;
use App\Http\Requests\Client\ListClientsRequest;
use App\Http\Requests\Client\ShowClientRequest;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Services\ClientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function __construct(
        private readonly ClientService $service,
    ) {}

    public function index(ListClientsRequest $request): AnonymousResourceCollection
    {
        $page = (int) ($request->validated('page') ?? 1);
        $perPage = (int) ($request->validated('per_page') ?? 10);
        $userId = $this->authenticatedUserId($request);

        return ClientResource::collection($this->service->list($userId, $page, $perPage));
    }

    public function show(ShowClientRequest $request, int $client): ClientResource
    {
        return ClientResource::make(
            $this->service->find($this->authenticatedUserId($request), $client),
        );
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = $this->service->create(
            $this->authenticatedUserId($request),
            $request->validated(),
        );

        return ClientResource::make($client)
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateClientRequest $request, int $client): ClientResource
    {
        return ClientResource::make(
            $this->service->update(
                $this->authenticatedUserId($request),
                $client,
                $request->validated(),
            )
        );
    }

    public function destroy(DestroyClientRequest $request, int $client): JsonResponse
    {
        $this->service->delete($this->authenticatedUserId($request), $client);

        return response()->json([
            'message' => 'Cliente removido com sucesso.',
        ]);
    }

    private function authenticatedUserId(Request $request): int
    {
        return (int) $request->user()->getAuthIdentifier();
    }
}
