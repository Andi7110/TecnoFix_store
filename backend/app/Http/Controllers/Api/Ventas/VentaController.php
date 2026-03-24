<?php

namespace App\Http\Controllers\Api\Ventas;

use App\Actions\Ventas\RegistrarVentaAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Ventas\IndexVentaRequest;
use App\Http\Requests\Ventas\StoreVentaRequest;
use App\Http\Resources\Ventas\VentaResource;
use App\Models\Venta;
use App\Services\Ventas\VentaService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VentaController extends Controller
{
    public function __construct(
        private readonly VentaService $ventaService,
        private readonly RegistrarVentaAction $registrarVenta,
    ) {
    }

    public function index(IndexVentaRequest $request): AnonymousResourceCollection
    {
        return VentaResource::collection(
            $this->ventaService->paginate($request->validated())
        );
    }

    public function store(StoreVentaRequest $request): VentaResource
    {
        return new VentaResource(
            $this->registrarVenta->execute($request->validated())
        );
    }

    public function show(Venta $venta): VentaResource
    {
        return new VentaResource(
            $this->ventaService->loadRelations($venta)
        );
    }
}
