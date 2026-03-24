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

        $query = InventarioProducto::query()
            ->whereHas('producto', fn ($builder) => $builder->where('estado', true))
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
                'modulo:id,nombre',
                'categoria:id,nombre',
                'registradoPor:id,name,username,email',
            ]);

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
