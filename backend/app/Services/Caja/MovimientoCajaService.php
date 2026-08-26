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
                'comprobantes:id,movimiento_caja_id,nombre_original,mime_type',
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
            'comprobantes:id,movimiento_caja_id,nombre_original,mime_type',
        ]);
    }

    private function buildSummary(array $filters): array
    {
        unset($filters['per_page']);

        $query = MovimientoCaja::query();
        $this->filter->apply($query, $filters);

        $totals = $query
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'entrada' THEN monto ELSE 0 END), 0) AS entradas_balance")
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'entrada' AND categoria_movimiento != 'saldo_inicial' THEN monto ELSE 0 END), 0) AS entradas_operativas")
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'salida' THEN monto ELSE 0 END), 0) AS salidas")
            ->first();

        $entradasBalance = (float) ($totals->entradas_balance ?? 0);
        $entradasOperativas = (float) ($totals->entradas_operativas ?? 0);
        $salidas = (float) ($totals->salidas ?? 0);
        $saldoInicial = (float) MovimientoCaja::query()
            ->where('categoria_movimiento', 'saldo_inicial')
            ->sum('monto');

        return [
            'total_entradas' => round($entradasOperativas, 2),
            'total_salidas' => round($salidas, 2),
            'balance' => round($entradasBalance - $salidas, 2),
            'saldo_inicial' => round($saldoInicial, 2),
            'saldo_inicial_registrado' => $saldoInicial > 0,
        ];
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }
}
