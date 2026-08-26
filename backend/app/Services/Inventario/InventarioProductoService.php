<?php

namespace App\Services\Inventario;

use App\Models\InventarioProducto;
use App\Support\Filters\Inventario\InventarioProductoFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InventarioProductoService
{
    public function __construct(
        private readonly InventarioProductoFilter $filter,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);
        $hasStockStatusFilter = filter_var($filters['agotado'] ?? false, FILTER_VALIDATE_BOOLEAN)
            || filter_var($filters['stock_critico'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $query = InventarioProducto::query()
            ->whereHas('producto', fn ($builder) => $builder
                ->where('estado', true))
            ->select([
                'id',
                'producto_id',
                'modulo_id',
                'categoria_id',
                'registrado_por',
                'codigo',
                'nombre',
                'descripcion',
                'foto_path',
                'precio_compra',
                'precio_venta',
                'stock_inicial',
                'stock_minimo',
                'unidad_medida',
                'estado',
                'fecha_registro',
                'created_at',
                'updated_at',
            ])
            ->with([
                'producto:id,nombre,codigo,stock,foto_path',
                'modulo:id,nombre',
                'categoria:id,nombre',
                'registradoPor:id,name,username,email',
            ]);

        if (! $hasStockStatusFilter) {
            $query->whereHas('producto', fn ($builder) => $builder->where('stock', '>', 0));
        }

        $this->filter->apply($query, $filters);

        return $query
            ->orderByDesc('fecha_registro')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }
}
