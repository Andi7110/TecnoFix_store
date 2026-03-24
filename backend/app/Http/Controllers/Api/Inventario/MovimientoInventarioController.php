<?php

namespace App\Http\Controllers\Api\Inventario;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventario\MovimientoInventario\IndexMovimientoInventarioRequest;
use App\Http\Requests\Inventario\MovimientoInventario\StoreMovimientoInventarioRequest;
use App\Http\Resources\Inventario\MovimientoInventarioResource;
use App\Models\MovimientoInventario;
use App\Services\Inventario\MovimientoInventarioService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MovimientoInventarioController extends Controller
{
    public function __construct(
        private readonly MovimientoInventarioService $movimientoInventarioService,
    ) {
    }

    public function index(IndexMovimientoInventarioRequest $request): AnonymousResourceCollection
    {
        return MovimientoInventarioResource::collection(
            $this->movimientoInventarioService->paginate($request->validated())
        );
    }

    public function store(StoreMovimientoInventarioRequest $request): MovimientoInventarioResource
    {
        return new MovimientoInventarioResource(
            $this->movimientoInventarioService->create($request->validated())
        );
    }

    public function show(MovimientoInventario $movimiento): MovimientoInventarioResource
    {
        return new MovimientoInventarioResource(
            $this->movimientoInventarioService->loadRelations($movimiento)
        );
    }
}
