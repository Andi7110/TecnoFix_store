<?php

namespace App\Http\Controllers\Api\Inventario;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventario\Modulo\IndexModuloRequest;
use App\Http\Requests\Inventario\Modulo\StoreModuloRequest;
use App\Http\Requests\Inventario\Modulo\UpdateModuloRequest;
use App\Http\Resources\Inventario\ModuloResource;
use App\Models\Modulo;
use App\Services\Inventario\ModuloService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ModuloController extends Controller
{
    public function __construct(
        private readonly ModuloService $moduloService,
    ) {
    }

    public function index(IndexModuloRequest $request): AnonymousResourceCollection
    {
        return ModuloResource::collection(
            $this->moduloService->paginate($request->validated())
        );
    }

    public function store(StoreModuloRequest $request): ModuloResource
    {
        return new ModuloResource(
            $this->moduloService->loadRelations(
                $this->moduloService->create($request->validated())
            )
        );
    }

    public function show(Modulo $modulo): ModuloResource
    {
        return new ModuloResource(
            $this->moduloService->loadRelations($modulo)
        );
    }

    public function update(UpdateModuloRequest $request, Modulo $modulo): ModuloResource
    {
        return new ModuloResource(
            $this->moduloService->update($modulo, $request->validated())
        );
    }
}
