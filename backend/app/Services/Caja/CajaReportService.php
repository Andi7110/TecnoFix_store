<?php

namespace App\Services\Caja;

use App\Models\ReporteFinanciero;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CajaReportService
{
    private const REPORT_TYPE = 'cierre_caja_mensual';

    public function monthly(array $filters): array
    {
        $year = (int) $filters['anio'];
        $month = (int) $filters['mes'];
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $totals = DB::table('movimientos_caja')
            ->whereBetween('fecha_movimiento', [$start, $end])
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'entrada' AND categoria_movimiento != 'saldo_inicial' THEN monto ELSE 0 END), 0) AS entradas")
            ->selectRaw("COALESCE(SUM(CASE WHEN categoria_movimiento = 'saldo_inicial' THEN monto ELSE 0 END), 0) AS saldo_inicial")
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'salida' THEN monto ELSE 0 END), 0) AS salidas")
            ->selectRaw('COUNT(*) AS movimientos')
            ->first();

        $entries = round((float) ($totals->entradas ?? 0), 2);
        $exits = round((float) ($totals->salidas ?? 0), 2);
        $openingBalance = round((float) ($totals->saldo_inicial ?? 0), 2);

        $sales = DB::table('ventas')
            ->whereBetween('fecha_venta', [$start, $end])
            ->selectRaw('COUNT(*) AS cantidad')
            ->selectRaw('COALESCE(SUM(total), 0) AS total')
            ->first();

        $costOfSales = round((float) DB::table('detalle_ventas as dv')
            ->join('ventas as v', 'v.id', '=', 'dv.venta_id')
            ->whereBetween('v.fecha_venta', [$start, $end])
            ->sum(DB::raw('dv.costo_unitario * dv.cantidad')), 2);

        $operatingCosts = round((float) DB::table('costos_operativos')
            ->whereBetween('fecha_costo', [$start->toDateString(), $end->toDateString()])
            ->where('tipo_costo', '!=', 'compra')
            ->sum('monto'), 2);

        $inventoryPurchases = round((float) DB::table('costos_operativos')
            ->whereBetween('fecha_costo', [$start->toDateString(), $end->toDateString()])
            ->where('tipo_costo', 'compra')
            ->sum('monto'), 2);

        $salesTotal = round((float) ($sales->total ?? 0), 2);
        $grossProfit = round($salesTotal - $costOfSales, 2);
        $netResult = round($entries - $exits, 2);

        $breakdown = DB::table('movimientos_caja')
            ->whereBetween('fecha_movimiento', [$start, $end])
            ->select('tipo_movimiento', 'categoria_movimiento')
            ->selectRaw('COUNT(*) AS cantidad')
            ->selectRaw('COALESCE(SUM(monto), 0) AS total')
            ->groupBy('tipo_movimiento', 'categoria_movimiento')
            ->orderBy('tipo_movimiento')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'tipo' => $row->tipo_movimiento,
                'categoria' => $row->categoria_movimiento,
                'cantidad' => (int) $row->cantidad,
                'total' => round((float) $row->total, 2),
            ])
            ->values()
            ->all();

        $daily = DB::table('movimientos_caja')
            ->whereBetween('fecha_movimiento', [$start, $end])
            ->selectRaw('DATE(fecha_movimiento) AS fecha')
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'entrada' AND categoria_movimiento != 'saldo_inicial' THEN monto ELSE 0 END), 0) AS entradas")
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'salida' THEN monto ELSE 0 END), 0) AS salidas")
            ->groupByRaw('DATE(fecha_movimiento)')
            ->orderBy('fecha')
            ->get()
            ->map(fn (object $row): array => [
                'fecha' => $row->fecha,
                'entradas' => round((float) $row->entradas, 2),
                'salidas' => round((float) $row->salidas, 2),
                'neto' => round((float) $row->entradas - (float) $row->salidas, 2),
            ])
            ->all();

        $closedReport = ReporteFinanciero::query()
            ->where('tipo_reporte', self::REPORT_TYPE)
            ->where('anio', $year)
            ->where('mes', $month)
            ->latest('id')
            ->first();

        return [
            'periodo' => [
                'anio' => $year,
                'mes' => $month,
                'etiqueta' => ucfirst($start->locale('es')->translatedFormat('F \d\e Y')),
                'inicio' => $start->toDateString(),
                'fin' => $end->toDateString(),
            ],
            'resumen' => [
                'entradas' => $entries,
                'saldo_inicial' => $openingBalance,
                'salidas' => $exits,
                'resultado_neto' => $netResult,
                'movimientos' => (int) ($totals->movimientos ?? 0),
                'ventas' => $salesTotal,
                'ventas_count' => (int) ($sales->cantidad ?? 0),
                'costo_ventas' => $costOfSales,
                'utilidad_bruta_ventas' => $grossProfit,
                'costos_operativos' => $operatingCosts,
                'compras_inventario' => $inventoryPurchases,
                'margen_caja_porcentaje' => $entries > 0 ? round(($netResult / $entries) * 100, 2) : 0,
            ],
            'desglose' => $breakdown,
            'evolucion_diaria' => $daily,
            'cierre' => $closedReport ? [
                'id' => $closedReport->id,
                'cerrado_en' => $closedReport->created_at,
                'actualizado_en' => $closedReport->updated_at,
            ] : null,
            'generated_at' => now(),
        ];
    }

    public function balanceSheet(array $filters): array
    {
        $year = (int) $filters['anio'];
        $month = (int) $filters['mes'];
        $date = Carbon::create($year, $month, 1)->startOfMonth()->endOfMonth();

        $cashBalance = $this->cashBalanceUntil($date);
        $accountsReceivable = $this->accountsReceivableUntil($date);
        $inventory = $this->inventoryValueUntil($date);

        $totalAssets = round($cashBalance + $accountsReceivable + $inventory['valor'], 2);
        $totalLiabilities = 0.0;
        $equity = round($totalAssets - $totalLiabilities, 2);

        return [
            'periodo' => [
                'anio' => $year,
                'mes' => $month,
                'etiqueta' => ucfirst($date->locale('es')->translatedFormat('F \d\e Y')),
                'fecha_corte' => $date->toDateString(),
            ],
            'activos' => [
                'corrientes' => [
                    [
                        'codigo' => 'caja_bancos',
                        'nombre' => 'Caja y bancos',
                        'monto' => $cashBalance,
                        'descripcion' => 'Entradas menos salidas registradas en caja hasta la fecha de corte.',
                    ],
                    [
                        'codigo' => 'cuentas_por_cobrar',
                        'nombre' => 'Cuentas por cobrar',
                        'monto' => $accountsReceivable,
                        'descripcion' => 'Saldo pendiente de cuentas creadas hasta la fecha de corte menos abonos aplicados.',
                    ],
                    [
                        'codigo' => 'inventario',
                        'nombre' => 'Inventario al costo',
                        'monto' => $inventory['valor'],
                        'descripcion' => 'Unidades disponibles valorizadas al precio de compra.',
                    ],
                ],
                'total_corrientes' => $totalAssets,
                'total' => $totalAssets,
            ],
            'pasivos' => [
                'corrientes' => [],
                'total_corrientes' => $totalLiabilities,
                'total' => $totalLiabilities,
            ],
            'patrimonio' => [
                'partidas' => [
                    [
                        'codigo' => 'patrimonio_calculado',
                        'nombre' => 'Patrimonio calculado',
                        'monto' => $equity,
                        'descripcion' => 'Diferencia entre activos y pasivos registrados en el sistema.',
                    ],
                ],
                'total' => $equity,
            ],
            'resumen' => [
                'total_activos' => $totalAssets,
                'total_pasivos' => $totalLiabilities,
                'total_patrimonio' => $equity,
                'pasivo_mas_patrimonio' => round($totalLiabilities + $equity, 2),
                'diferencia' => round($totalAssets - ($totalLiabilities + $equity), 2),
                'unidades_inventario' => $inventory['unidades'],
            ],
            'notas' => [
                'El sistema aun no registra cuentas por pagar, prestamos, impuestos por pagar ni capital aportado; por eso los pasivos quedan en cero.',
                'El patrimonio se calcula como activos menos pasivos registrados.',
                'El inventario se reconstruye con el ultimo movimiento de cada producto hasta la fecha de corte; si un producto no tiene movimientos previos, se usa su stock actual como referencia.',
            ],
            'generated_at' => now(),
        ];
    }

    public function closeMonth(array $filters, ?User $user): ReporteFinanciero
    {
        $report = $this->monthly($filters);
        $year = (int) data_get($report, 'periodo.anio');
        $month = (int) data_get($report, 'periodo.mes');

        $closure = ReporteFinanciero::query()->firstOrCreate(
            [
                'tipo_reporte' => self::REPORT_TYPE,
                'anio' => $year,
                'mes' => $month,
                'modulo_id' => null,
            ],
            [
                'titulo' => 'Cierre de caja '.data_get($report, 'periodo.etiqueta'),
                'generado_por' => $user?->id,
                'fecha_reporte' => data_get($report, 'periodo.fin'),
                'payload' => $report,
            ],
        );

        return $closure->load(['generadoPor:id,name,username,email']);
    }

    private function cashBalanceUntil(Carbon $date): float
    {
        $totals = DB::table('movimientos_caja')
            ->where('fecha_movimiento', '<=', $date)
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'entrada' THEN monto ELSE 0 END), 0) AS entradas")
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'salida' THEN monto ELSE 0 END), 0) AS salidas")
            ->first();

        return round((float) ($totals->entradas ?? 0) - (float) ($totals->salidas ?? 0), 2);
    }

    private function accountsReceivableUntil(Carbon $date): float
    {
        $abonos = DB::table('abonos_cuentas_por_cobrar')
            ->select('cuenta_por_cobrar_id')
            ->selectRaw('COALESCE(SUM(monto), 0) AS total_abonado')
            ->where('fecha_abono', '<=', $date)
            ->groupBy('cuenta_por_cobrar_id');

        $total = DB::table('cuentas_por_cobrar as cxc')
            ->leftJoinSub($abonos, 'abonos', function ($join): void {
                $join->on('abonos.cuenta_por_cobrar_id', '=', 'cxc.id');
            })
            ->where('cxc.fecha_cuenta', '<=', $date)
            ->selectRaw('COALESCE(SUM(GREATEST(cxc.monto_original - COALESCE(abonos.total_abonado, 0), 0)), 0) AS saldo')
            ->value('saldo');

        return round((float) $total, 2);
    }

    private function inventoryValueUntil(Carbon $date): array
    {
        $dateValue = $date->toDateTimeString();

        $row = DB::table('productos as p')
            ->selectRaw(
                "
                COALESCE(SUM(
                    COALESCE(
                        (
                            SELECT mi.stock_nuevo
                            FROM movimientos_inventario mi
                            WHERE mi.producto_id = p.id
                                AND mi.fecha_movimiento <= ?
                            ORDER BY mi.fecha_movimiento DESC, mi.id DESC
                            LIMIT 1
                        ),
                        CASE WHEN p.created_at <= ? THEN p.stock ELSE 0 END
                    )
                ), 0) AS unidades,
                COALESCE(SUM(
                    COALESCE(
                        (
                            SELECT mi.stock_nuevo
                            FROM movimientos_inventario mi
                            WHERE mi.producto_id = p.id
                                AND mi.fecha_movimiento <= ?
                            ORDER BY mi.fecha_movimiento DESC, mi.id DESC
                            LIMIT 1
                        ),
                        CASE WHEN p.created_at <= ? THEN p.stock ELSE 0 END
                    ) * p.precio_compra
                ), 0) AS valor
                ",
                [$dateValue, $dateValue, $dateValue, $dateValue],
            )
            ->first();

        return [
            'unidades' => (int) ($row->unidades ?? 0),
            'valor' => round((float) ($row->valor ?? 0), 2),
        ];
    }

    public function history(array $filters): LengthAwarePaginator
    {
        return ReporteFinanciero::query()
            ->with(['generadoPor:id,name,username,email'])
            ->where('tipo_reporte', self::REPORT_TYPE)
            ->orderByDesc('anio')
            ->orderByDesc('mes')
            ->paginate((int) ($filters['per_page'] ?? 12))
            ->withQueryString();
    }
}
