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
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'entrada' THEN monto ELSE 0 END), 0) AS entradas")
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'salida' THEN monto ELSE 0 END), 0) AS salidas")
            ->selectRaw('COUNT(*) AS movimientos')
            ->first();

        $entries = round((float) ($totals->entradas ?? 0), 2);
        $exits = round((float) ($totals->salidas ?? 0), 2);

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
            ->selectRaw("COALESCE(SUM(CASE WHEN tipo_movimiento = 'entrada' THEN monto ELSE 0 END), 0) AS entradas")
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
