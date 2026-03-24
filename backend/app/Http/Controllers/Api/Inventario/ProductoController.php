<?php

namespace App\Http\Controllers\Api\Inventario;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventario\Producto\IndexProductoRequest;
use App\Http\Requests\Inventario\Producto\StoreProductoRequest;
use App\Http\Requests\Inventario\Producto\UpdateEstadoProductoRequest;
use App\Http\Requests\Inventario\Producto\UpdateProductoRequest;
use App\Http\Resources\Inventario\ProductoResource;
use App\Models\Producto;
use App\Services\Inventario\ProductoService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductoController extends Controller
{
    public function __construct(
        private readonly ProductoService $productoService,
    ) {
    }

    public function index(IndexProductoRequest $request): AnonymousResourceCollection
    {
        return ProductoResource::collection(
            $this->productoService->paginate($request->validated())
        );
    }

    public function store(StoreProductoRequest $request): ProductoResource
    {
        return new ProductoResource(
            $this->productoService->create(
                $request->validated(),
                $request->user()?->id,
            )
        );
    }

    public function show(Producto $producto): ProductoResource
    {
        return new ProductoResource(
            $this->productoService->loadRelations($producto)
        );
    }

    public function update(UpdateProductoRequest $request, Producto $producto): ProductoResource
    {
        return new ProductoResource(
            $this->productoService->update($producto, $request->validated())
        );
    }

    public function updateEstado(UpdateEstadoProductoRequest $request, Producto $producto): ProductoResource
    {
        return new ProductoResource(
            $this->productoService->changeStatus($producto, $request->boolean('estado'))
        );
    }

    public function foto(string $path): StreamedResponse
    {
        $normalizedPath = ltrim($path, '/');

        if ($normalizedPath === '' || str_contains($normalizedPath, '..')) {
            abort(404);
        }

        if (Storage::disk('imagenes')->exists($normalizedPath)) {
            return Storage::disk('imagenes')->response($normalizedPath);
        }

        if (Storage::disk('public')->exists($normalizedPath)) {
            return Storage::disk('public')->response($normalizedPath);
        }

        abort(404);
    }
}
