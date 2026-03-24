<?php

namespace App\Http\Controllers\Api\Inventario;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventario\Categoria\IndexCategoriaRequest;
use App\Http\Requests\Inventario\Categoria\StoreCategoriaRequest;
use App\Http\Requests\Inventario\Categoria\UpdateCategoriaRequest;
use App\Http\Resources\Inventario\CategoriaResource;
use App\Models\Categoria;
use App\Services\Inventario\CategoriaService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoriaController extends Controller
{
    public function __construct(
        private readonly CategoriaService $categoriaService,
    ) {
    }

    public function index(IndexCategoriaRequest $request): AnonymousResourceCollection
    {
        return CategoriaResource::collection(
            $this->categoriaService->paginate($request->validated())
        );
    }

    public function store(StoreCategoriaRequest $request): CategoriaResource
    {
        return new CategoriaResource(
            $this->categoriaService->create($request->validated())
        );
    }

    public function show(Categoria $categoria): CategoriaResource
    {
        return new CategoriaResource(
            $this->categoriaService->loadRelations($categoria)
        );
    }

    public function update(UpdateCategoriaRequest $request, Categoria $categoria): CategoriaResource
    {
        return new CategoriaResource(
            $this->categoriaService->update($categoria, $request->validated())
        );
    }
}
