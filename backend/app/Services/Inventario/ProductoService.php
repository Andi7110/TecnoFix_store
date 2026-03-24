<?php

namespace App\Services\Inventario;

use App\Actions\Inventario\CambiarEstadoProductoAction;
use App\Actions\Inventario\RegistrarInventarioProductoAction;
use App\Actions\Inventario\RegistrarMovimientoInventarioAction;
use App\Models\Producto;
use App\Support\Filters\Inventario\ProductoFilter;
use Illuminate\Http\UploadedFile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductoService
{
    public function __construct(
        private readonly ProductoFilter $filter,
        private readonly RegistrarMovimientoInventarioAction $registrarMovimiento,
        private readonly CambiarEstadoProductoAction $cambiarEstadoProducto,
        private readonly RegistrarInventarioProductoAction $registrarInventarioProducto,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        $query = Producto::query()
            ->select([
                'id',
                'categoria_id',
                'modulo_id',
                'codigo',
                'nombre',
                'descripcion',
                'foto_path',
                'precio_compra',
                'precio_venta',
                'stock',
                'stock_minimo',
                'unidad_medida',
                'estado',
                'created_at',
                'updated_at',
            ])
            ->with([
                'modulo:id,nombre,estado',
                'categoria:id,modulo_id,nombre,estado',
            ]);

        $this->filter->apply($query, $filters);

        return $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data, ?int $registradoPor = null): Producto
    {
        return DB::transaction(function () use ($data, $registradoPor): Producto {
            $stockInicial = (int) ($data['stock_inicial'] ?? 0);
            $fotoPath = $this->storeFoto($data['foto'] ?? null);

            unset($data['stock_inicial']);
            unset($data['foto']);

            $producto = Producto::query()->create([
                ...$data,
                'stock' => 0,
                'foto_path' => $fotoPath,
            ]);

            if ($stockInicial > 0) {
                $this->registrarMovimiento->execute($producto, [
                    'tipo_movimiento' => 'entrada',
                    'cantidad' => $stockInicial,
                    'motivo' => 'ingreso_manual',
                    'referencia' => null,
                    'fecha_movimiento' => now(),
                    'observacion' => 'Stock inicial registrado al crear el producto.',
                ]);
            }

            $this->registrarInventarioProducto->execute(
                $producto->refresh(),
                $stockInicial,
                $registradoPor,
            );

            return $this->loadRelations($producto->refresh());
        });
    }

    public function update(Producto $producto, array $data): Producto
    {
        $foto = $data['foto'] ?? null;
        unset($data['foto']);

        if ($foto instanceof UploadedFile) {
            $fotoPath = $this->storeFoto($foto);
            $oldPath = $producto->foto_path;

            $producto->update([
                ...$data,
                'foto_path' => $fotoPath,
            ]);

            $this->deleteFoto($oldPath);

            return $this->loadRelations($producto);
        }

        $producto->update($data);

        return $this->loadRelations($producto);
    }

    public function changeStatus(Producto $producto, bool $estado): Producto
    {
        $producto = $this->cambiarEstadoProducto->execute($producto, $estado);

        return $this->loadRelations($producto);
    }

    public function loadRelations(Producto $producto): Producto
    {
        return $producto->load([
            'modulo:id,nombre,estado',
            'categoria:id,modulo_id,nombre,estado',
        ]);
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }

    private function storeFoto(mixed $foto): ?string
    {
        if (! $foto instanceof UploadedFile) {
            return null;
        }

        return $foto->store('productos', 'imagenes');
    }

    private function deleteFoto(?string $path): void
    {
        if (blank($path)) {
            return;
        }

        Storage::disk('imagenes')->delete($path);
        Storage::disk('public')->delete($path);
    }
}
