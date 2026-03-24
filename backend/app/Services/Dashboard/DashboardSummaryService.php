<?php

namespace App\Services\Dashboard;

use Illuminate\Support\Facades\DB;

class DashboardSummaryService
{
    public function getSummary(): array
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        $ventasHoy = (float) DB::table('ventas')
            ->whereBetween('fecha_venta', [$todayStart, $todayEnd])
            ->sum('total');

        $movimientosHoy = DB::table('movimientos_caja')
            ->selectRaw("
                SUM(CASE WHEN tipo_movimiento = 'entrada' THEN monto ELSE 0 END) as total_entradas,
                SUM(CASE WHEN tipo_movimiento = 'salida' THEN monto ELSE 0 END) as total_salidas
            ")
            ->whereBetween('fecha_movimiento', [$todayStart, $todayEnd])
            ->first();

        $productosStockBajo = (int) DB::table('productos')
            ->where('estado', true)
            ->whereColumn('stock', '<=', 'stock_minimo')
            ->count();

        $reparacionesPendientes = (int) DB::table('reparaciones')
            ->whereIn('estado_reparacion', ['registrado', 'en_proceso'])
            ->count();

        $ventasPorModulo = DB::table('ventas as v')
            ->join('modulos as m', 'm.id', '=', 'v.modulo_id')
            ->selectRaw('
                v.modulo_id,
                m.nombre as modulo_nombre,
                COUNT(v.id) as ventas_count,
                SUM(v.total) as total_vendido
            ')
            ->whereBetween('v.fecha_venta', [$todayStart, $todayEnd])
            ->groupBy('v.modulo_id', 'm.nombre')
            ->orderByDesc('total_vendido')
            ->get()
            ->map(fn (object $row): array => [
                'modulo_id' => (int) $row->modulo_id,
                'modulo_nombre' => $row->modulo_nombre,
                'ventas_count' => (int) $row->ventas_count,
                'total_vendido' => round((float) $row->total_vendido, 2),
            ])
            ->all();

        $totalEntradasHoy = round((float) ($movimientosHoy->total_entradas ?? 0), 2);
        $totalSalidasHoy = round((float) ($movimientosHoy->total_salidas ?? 0), 2);
        $totalVendidoHoy = round($ventasHoy, 2);

        return [
            'today' => [
                'total_vendido' => $totalVendidoHoy,
                'total_entradas' => $totalEntradasHoy,
                'total_salidas' => $totalSalidasHoy,
                'productos_stock_bajo' => $productosStockBajo,
                'reparaciones_pendientes' => $reparacionesPendientes,
            ],
            'ventas_por_modulo' => $ventasPorModulo,
            'resumen_dia' => [
                'fecha' => $todayStart->toDateString(),
                'balance_caja' => round($totalEntradasHoy - $totalSalidasHoy, 2),
                'modulos_con_ventas' => count($ventasPorModulo),
            ],
            'generated_at' => now(),
        ];
    }
}
