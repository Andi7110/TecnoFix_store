<?php

namespace App\Http\Controllers\Api\Costos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Costos\IndexCostoOperativoRequest;
use App\Http\Requests\Costos\StoreCompraInventarioRequest;
use App\Http\Requests\Costos\StoreCostoOperativoRequest;
use App\Http\Resources\Costos\CostoOperativoResource;
use App\Services\Costos\CostoOperativoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CostoOperativoController extends Controller
{
    public function __construct(private readonly CostoOperativoService $costoOperativoService)
    {
    }

    public function index(IndexCostoOperativoRequest $request): AnonymousResourceCollection
    {
        $result = $this->costoOperativoService->paginate($request->validated());

        return CostoOperativoResource::collection($result['costos'])
            ->additional([
                'summary' => $result['summary'],
            ]);
    }

    public function store(StoreCostoOperativoRequest $request): CostoOperativoResource
    {
        return new CostoOperativoResource(
            $this->costoOperativoService->store($request->validated(), $request->user()?->id)
        );
    }

    public function storeCompra(StoreCompraInventarioRequest $request): CostoOperativoResource
    {
        return new CostoOperativoResource(
            $this->costoOperativoService->storeCompra($request->validated(), $request->user()?->id)
        );
    }

    public function summary(IndexCostoOperativoRequest $request): JsonResponse
    {
        return response()->json([
            'data' => $this->costoOperativoService->buildSummary($request->validated()),
        ]);
    }
}
