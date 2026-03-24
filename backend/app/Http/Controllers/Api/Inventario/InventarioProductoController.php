<?php

namespace App\Http\Controllers\Api\Inventario;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventario\Producto\IndexInventarioProductoRequest;
use App\Http\Resources\Inventario\InventarioProductoResource;
use App\Services\Inventario\InventarioProductoService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InventarioProductoController extends Controller
{
    public function __construct(
        private readonly InventarioProductoService $inventarioProductoService,
    ) {
    }

    public function index(IndexInventarioProductoRequest $request): AnonymousResourceCollection
    {
        return InventarioProductoResource::collection(
            $this->inventarioProductoService->paginate($request->validated())
        );
    }
}
