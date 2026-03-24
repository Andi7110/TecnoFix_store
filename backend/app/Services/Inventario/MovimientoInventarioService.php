<?php

namespace App\Services\Inventario;

use App\Actions\Inventario\RegistrarMovimientoInventarioAction;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Support\Filters\Inventario\MovimientoInventarioFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MovimientoInventarioService
{
    public function __construct(
        private readonly MovimientoInventarioFilter $filter,
        private readonly RegistrarMovimientoInventarioAction $registrarMovimiento,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        $query = MovimientoInventario::query()
            ->select([
                'id',
                'producto_id',
                'tipo_movimiento',
                'cantidad',
                'stock_anterior',
                'stock_nuevo',
                'motivo',
                'referencia',
                'fecha_movimiento',
                'observacion',
                'created_at',
                'updated_at',
            ])
            ->with([
                'producto:id,modulo_id,categoria_id,codigo,nombre,stock,stock_minimo,estado',
            ]);

        $this->filter->apply($query, $filters);

        return $query
            ->orderByDesc('fecha_movimiento')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): MovimientoInventario
    {
        return DB::transaction(function () use ($data): MovimientoInventario {
            $producto = Producto::query()->findOrFail($data['producto_id']);

            return $this->registrarMovimiento
                ->execute($producto, $data)
                ->load([
                    'producto:id,modulo_id,categoria_id,codigo,nombre,stock,stock_minimo,estado',
                ]);
        });
    }

    public function loadRelations(MovimientoInventario $movimientoInventario): MovimientoInventario
    {
        return $movimientoInventario->load([
            'producto:id,modulo_id,categoria_id,codigo,nombre,stock,stock_minimo,estado',
        ]);
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }
}
