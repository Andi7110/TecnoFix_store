<?php

namespace App\Services\Ventas;

use App\Models\Venta;
use App\Support\Filters\Ventas\VentaFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class VentaService
{
    public function __construct(
        private readonly VentaFilter $filter,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        $query = Venta::query()
            ->select([
                'id',
                'modulo_id',
                'numero_venta',
                'fecha_venta',
                'subtotal',
                'descuento',
                'total',
                'metodo_pago',
                'observacion',
                'created_at',
                'updated_at',
            ])
            ->with([
                'modulo:id,nombre,estado',
            ])
            ->withCount('detalles');

        $this->filter->apply($query, $filters);

        return $query
            ->orderByDesc('fecha_venta')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function loadRelations(Venta $venta): Venta
    {
        return $venta->load([
            'modulo:id,nombre,estado',
            'detalles.producto:id,codigo,nombre,unidad_medida',
        ])->loadCount('detalles');
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }
}
