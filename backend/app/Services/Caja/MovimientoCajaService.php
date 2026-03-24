<?php

namespace App\Services\Caja;

use App\Models\MovimientoCaja;
use App\Support\Filters\Caja\MovimientoCajaFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MovimientoCajaService
{
    public function __construct(
        private readonly MovimientoCajaFilter $filter,
    ) {
    }

    public function paginate(array $filters): array
    {
        $filtersForSummary = $filters;
        $perPage = $this->resolvePerPage($filters);

        $query = MovimientoCaja::query()
            ->select([
                'id',
                'modulo_id',
                'tipo_movimiento',
                'categoria_movimiento',
                'concepto',
                'monto',
                'fecha_movimiento',
                'referencia',
                'observacion',
                'created_at',
                'updated_at',
            ])
            ->with([
                'modulo:id,nombre,estado',
            ]);

        $this->filter->apply($query, $filters);

        return [
            'movimientos' => $query
                ->orderByDesc('fecha_movimiento')
                ->orderByDesc('id')
                ->paginate($perPage)
                ->withQueryString(),
            'summary' => $this->buildSummary($filtersForSummary),
        ];
    }

    public function loadRelations(MovimientoCaja $movimientoCaja): MovimientoCaja
    {
        return $movimientoCaja->load([
            'modulo:id,nombre,estado',
        ]);
    }

    private function buildSummary(array $filters): array
    {
        unset($filters['per_page']);

        $query = MovimientoCaja::query();
        $this->filter->apply($query, $filters);

        $totals = $query
            ->selectRaw('tipo_movimiento, SUM(monto) as total')
            ->groupBy('tipo_movimiento')
            ->pluck('total', 'tipo_movimiento');

        $entradas = (float) ($totals['entrada'] ?? 0);
        $salidas = (float) ($totals['salida'] ?? 0);

        return [
            'total_entradas' => round($entradas, 2),
            'total_salidas' => round($salidas, 2),
            'balance' => round($entradas - $salidas, 2),
        ];
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }
}
