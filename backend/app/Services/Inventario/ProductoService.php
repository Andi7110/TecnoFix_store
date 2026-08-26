<?php

namespace App\Services\Inventario;

use App\Actions\Inventario\CambiarEstadoProductoAction;
use App\Actions\Inventario\RegistrarInventarioProductoAction;
use App\Actions\Inventario\RegistrarMovimientoInventarioAction;
use App\Models\Categoria;
use App\Models\InventarioProducto;
use App\Models\Producto;
use App\Support\Filters\Inventario\ProductoFilter;
use App\Support\Inventario\ProductoCode;
use Illuminate\Http\UploadedFile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

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
                'variantesDisponibles:id,producto_id,nombre,foto_path,disponible',
            ])
            ->withCount('variantes');

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
            $codigoAutomatico = (bool) ($data['codigo_automatico'] ?? false);
            unset($data['codigo_automatico']);

            if ($codigoAutomatico) {
                $data['codigo'] = $this->resolveNextCode(
                    (int) $data['modulo_id'],
                    (int) $data['categoria_id'],
                    true,
                )['codigo'];
            }

            $fotosVariantes = collect($data['fotos_variantes'] ?? [])
                ->filter(fn (mixed $foto): bool => $foto instanceof UploadedFile)
                ->values();
            $stockInicial = $fotosVariantes->isNotEmpty()
                ? $fotosVariantes->count()
                : (int) ($data['stock_inicial'] ?? 0);
            $fotoPath = $this->storeFoto($data['foto'] ?? null);

            unset($data['stock_inicial']);
            unset($data['foto']);
            unset($data['fotos_variantes']);

            $variantPaths = $fotosVariantes
                ->map(fn (UploadedFile $foto): ?string => $this->storeFoto($foto))
                ->filter()
                ->values();

            if (! $fotoPath && $variantPaths->isNotEmpty()) {
                $fotoPath = $variantPaths->first();
            }

            $producto = Producto::query()->create([
                ...$data,
                'stock' => 0,
                'foto_path' => $fotoPath,
            ]);

            foreach ($variantPaths as $index => $variantPath) {
                $producto->variantes()->create([
                    'nombre' => 'Diseño '.($index + 1),
                    'foto_path' => $variantPath,
                    'disponible' => true,
                ]);
            }

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

    public function nextCode(int $moduloId, int $categoriaId): array
    {
        return $this->resolveNextCode($moduloId, $categoriaId);
    }

    public function update(Producto $producto, array $data): Producto
    {
        $foto = $data['foto'] ?? null;
        $fotosVariantes = collect($data['fotos_variantes'] ?? [])
            ->filter(fn (mixed $item): bool => $item instanceof UploadedFile)
            ->values();
        unset($data['foto']);
        unset($data['fotos_variantes']);

        foreach ($fotosVariantes as $fotoVariante) {
            $producto->variantes()->create([
                'nombre' => 'Diseño '.($producto->variantes()->count() + 1),
                'foto_path' => $this->storeFoto($fotoVariante),
                'disponible' => true,
            ]);
        }

        if ($fotosVariantes->isNotEmpty()) {
            if (blank($producto->foto_path)) {
                $producto->update([
                    'foto_path' => $producto->variantes()->value('foto_path'),
                ]);
            }

            $this->registrarMovimiento->execute($producto, [
                'tipo_movimiento' => 'entrada',
                'cantidad' => $fotosVariantes->count(),
                'motivo' => 'ingreso_manual',
                'referencia' => null,
                'fecha_movimiento' => now(),
                'observacion' => 'Ingreso de nuevos diseños del producto.',
            ]);
        }

        if ($foto instanceof UploadedFile) {
            $fotoPath = $this->storeFoto($foto);
            $oldPath = $producto->foto_path;

            $producto->update([
                ...$data,
                'foto_path' => $fotoPath,
            ]);
            $producto->refresh();
            $this->syncInventarioSnapshot($producto);

            $this->deleteFoto($oldPath);

            return $this->loadRelations($producto);
        }

        $producto->update($data);
        $producto->refresh();
        $this->syncInventarioSnapshot($producto);

        return $this->loadRelations($producto);
    }

    public function changeStatus(Producto $producto, bool $estado): Producto
    {
        $producto = $this->cambiarEstadoProducto->execute($producto, $estado);

        return $this->loadRelations($producto);
    }

    public function delete(Producto $producto): void
    {
        $fotoPath = $producto->foto_path;
        $variantPaths = $producto->variantes()->pluck('foto_path');

        DB::transaction(function () use ($producto): void {
            $producto->movimientosInventario()->delete();
            $producto->delete();
        });

        $this->deleteFoto($fotoPath);
        $variantPaths->each(fn (?string $path) => $this->deleteFoto($path));
    }

    public function loadRelations(Producto $producto): Producto
    {
        return $producto->load([
            'modulo:id,nombre,estado',
            'categoria:id,modulo_id,nombre,estado',
            'variantesDisponibles:id,producto_id,nombre,foto_path,disponible',
        ])->loadCount('variantes');
    }

    private function resolveNextCode(int $moduloId, int $categoriaId, bool $lockForUpdate = false): array
    {
        $categoria = Categoria::query()
            ->select(['id', 'modulo_id', 'nombre'])
            ->with('modulo:id,nombre')
            ->where('modulo_id', $moduloId)
            ->findOrFail($categoriaId);
        $prefix = ProductoCode::prefix($categoria->modulo->nombre, $categoria->nombre);
        $query = Producto::query()
            ->where('codigo', 'like', $prefix.'-%');

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $lastSequence = $query
            ->pluck('codigo')
            ->map(function (string $codigo) use ($prefix): int {
                if (! preg_match('/^'.preg_quote($prefix, '/').'-(\d{3})$/', $codigo, $matches)) {
                    return 0;
                }

                return (int) $matches[1];
            })
            ->max() ?? 0;
        $nextSequence = $lastSequence + 1;

        if ($nextSequence > 999) {
            throw ValidationException::withMessages([
                'codigo' => ['La categoría alcanzó el límite de 999 códigos automáticos.'],
            ]);
        }

        return [
            'prefix' => $prefix,
            'sequence' => $nextSequence,
            'codigo' => ProductoCode::build($prefix, $nextSequence),
        ];
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

    private function syncInventarioSnapshot(Producto $producto): void
    {
        InventarioProducto::query()
            ->where('producto_id', $producto->id)
            ->update([
                'modulo_id' => $producto->modulo_id,
                'categoria_id' => $producto->categoria_id,
                'codigo' => $producto->codigo,
                'nombre' => $producto->nombre,
                'descripcion' => $producto->descripcion,
                'foto_path' => $producto->foto_path,
                'precio_compra' => $producto->precio_compra,
                'precio_venta' => $producto->precio_venta,
                'stock_minimo' => $producto->stock_minimo,
                'unidad_medida' => $producto->unidad_medida,
                'estado' => $producto->estado,
            ]);
    }
}
