<?php

namespace App\Services\CuentasPorCobrar;

use App\Models\AbonoCuentaPorCobrar;
use App\Models\CuentaPorCobrar;
use App\Models\MovimientoCaja;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CuentaPorCobrarService
{
    public function paginate(array $filters): array
    {
        $filtersForSummary = $filters;
        $perPage = $this->resolvePerPage($filters);

        $query = CuentaPorCobrar::query()
            ->with(['venta:id,numero_venta,total', 'modulo:id,nombre'])
            ->withCount('abonos');

        $this->applyFilters($query, $filters);

        return [
            'cuentas' => $query
                ->orderByRaw("CASE estado WHEN 'pendiente' THEN 1 WHEN 'vencida' THEN 2 WHEN 'pagada' THEN 3 ELSE 4 END")
                ->orderByDesc('fecha_cuenta')
                ->orderByDesc('id')
                ->paginate($perPage)
                ->withQueryString(),
            'summary' => $this->buildSummary($filtersForSummary),
        ];
    }

    public function loadRelations(CuentaPorCobrar $cuenta): CuentaPorCobrar
    {
        return $cuenta->load([
            'venta:id,numero_venta,total',
            'modulo:id,nombre',
            'abonos' => fn ($query) => $query->orderByDesc('fecha_abono')->orderByDesc('id'),
        ]);
    }

    public function abonar(CuentaPorCobrar $cuenta, array $data): CuentaPorCobrar
    {
        return DB::transaction(function () use ($cuenta, $data): CuentaPorCobrar {
            $cuenta->refresh();
            $saldo = round((float) $cuenta->saldo_pendiente, 2);

            if ($saldo <= 0) {
                abort(422, 'Esta cuenta ya esta pagada.');
            }

            $monto = min(round((float) $data['monto'], 2), $saldo);
            $saldoRestante = round($saldo - $monto, 2);

            $movimiento = MovimientoCaja::query()->create([
                'modulo_id' => $cuenta->modulo_id,
                'tipo_movimiento' => 'entrada',
                'categoria_movimiento' => 'cuenta_por_cobrar',
                'concepto' => 'Abono '.$cuenta->codigo,
                'monto' => $monto,
                'fecha_movimiento' => $data['fecha_abono'],
                'referencia' => $data['referencia'] ?? $cuenta->codigo,
                'observacion' => trim(implode(' ', array_filter([
                    'Abono de cuenta por cobrar '.$cuenta->codigo.'.',
                    $data['observacion'] ?? null,
                    'Saldo restante: $'.number_format($saldoRestante, 2, '.', ''),
                ]))),
            ]);

            AbonoCuentaPorCobrar::query()->create([
                'cuenta_por_cobrar_id' => $cuenta->id,
                'movimiento_caja_id' => $movimiento->id,
                'monto' => $monto,
                'fecha_abono' => $data['fecha_abono'],
                'metodo_pago' => $data['metodo_pago'],
                'referencia' => $data['referencia'] ?? null,
                'observacion' => $data['observacion'] ?? null,
            ]);

            $cuenta->update([
                'monto_pagado' => round((float) $cuenta->monto_pagado + $monto, 2),
                'saldo_pendiente' => $saldoRestante,
                'estado' => $saldoRestante <= 0 ? 'pagada' : 'pendiente',
            ]);

            return $this->loadRelations($cuenta->refresh());
        });
    }

    private function buildSummary(array $filters): array
    {
        unset($filters['per_page']);

        $query = CuentaPorCobrar::query();
        $this->applyFilters($query, $filters);

        $totals = $query
            ->selectRaw('COUNT(*) as cuentas_count')
            ->selectRaw('COALESCE(SUM(monto_original), 0) as total_original')
            ->selectRaw('COALESCE(SUM(monto_pagado), 0) as total_pagado')
            ->selectRaw('COALESCE(SUM(saldo_pendiente), 0) as total_pendiente')
            ->first();

        return [
            'cuentas_count' => (int) ($totals->cuentas_count ?? 0),
            'total_original' => round((float) ($totals->total_original ?? 0), 2),
            'total_pagado' => round((float) ($totals->total_pagado ?? 0), 2),
            'total_pendiente' => round((float) ($totals->total_pendiente ?? 0), 2),
        ];
    }

    private function applyFilters($query, array $filters): void
    {
        $query->porEstado($filters['estado'] ?? null)
            ->porModulo($filters['modulo_id'] ?? null);

        if (! blank($filters['cliente'] ?? null)) {
            $query->where(function ($builder) use ($filters): void {
                $builder->where('cliente_nombre', 'like', '%'.$filters['cliente'].'%')
                    ->orWhere('cliente_telefono', 'like', '%'.$filters['cliente'].'%')
                    ->orWhere('codigo', 'like', '%'.$filters['cliente'].'%');
            });
        }

        if (! blank($filters['fecha_desde'] ?? null)) {
            $query->whereDate('fecha_cuenta', '>=', $filters['fecha_desde']);
        }

        if (! blank($filters['fecha_hasta'] ?? null)) {
            $query->whereDate('fecha_cuenta', '<=', $filters['fecha_hasta']);
        }
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }
}
