<?php

namespace App\Services\Dashboard;

use Illuminate\Support\Facades\DB;

class DashboardSummaryService
{
    public function getSummary(): array
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();
        $yesterdayStart = now()->subDay()->startOfDay();
        $yesterdayEnd = now()->subDay()->endOfDay();

        $ventasHoy = (float) DB::table('ventas')
            ->whereBetween('fecha_venta', [$todayStart, $todayEnd])
            ->sum('total');

        $ventasAyer = (float) DB::table('ventas')
            ->whereBetween('fecha_venta', [$yesterdayStart, $yesterdayEnd])
            ->sum('total');

        $movimientosHoy = DB::table('movimientos_caja')
            ->selectRaw("
                SUM(CASE WHEN tipo_movimiento = 'entrada' THEN monto ELSE 0 END) as total_entradas,
                SUM(CASE WHEN tipo_movimiento = 'salida' THEN monto ELSE 0 END) as total_salidas
            ")
            ->whereBetween('fecha_movimiento', [$todayStart, $todayEnd])
            ->first();

        $movimientosAyer = DB::table('movimientos_caja')
            ->selectRaw("
                SUM(CASE WHEN tipo_movimiento = 'entrada' THEN monto ELSE 0 END) as total_entradas,
                SUM(CASE WHEN tipo_movimiento = 'salida' THEN monto ELSE 0 END) as total_salidas
            ")
            ->whereBetween('fecha_movimiento', [$yesterdayStart, $yesterdayEnd])
            ->first();

        $productosStockBajo = (int) DB::table('productos')
            ->where('estado', true)
            ->whereColumn('stock', '<=', 'stock_minimo')
            ->count();

        $reparacionesPendientes = (int) DB::table('reparaciones')
            ->whereIn('estado_reparacion', ['registrado', 'en_proceso'])
            ->count();

        $reparacionesPendientesAyer = (int) DB::table('reparaciones')
            ->whereIn('estado_reparacion', ['registrado', 'en_proceso'])
            ->where('created_at', '<=', $yesterdayEnd)
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
        $totalEntradasAyer = round((float) ($movimientosAyer->total_entradas ?? 0), 2);
        $totalSalidasAyer = round((float) ($movimientosAyer->total_salidas ?? 0), 2);
        $totalVendidoAyer = round($ventasAyer, 2);
        $actividadReciente = $this->buildRecentActivity();

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
            'comparativo_vs_ayer' => [
                'ventas' => [
                    'actual' => $totalVendidoHoy,
                    'anterior' => $totalVendidoAyer,
                    'delta' => round($totalVendidoHoy - $totalVendidoAyer, 2),
                ],
                'entradas' => [
                    'actual' => $totalEntradasHoy,
                    'anterior' => $totalEntradasAyer,
                    'delta' => round($totalEntradasHoy - $totalEntradasAyer, 2),
                ],
                'salidas' => [
                    'actual' => $totalSalidasHoy,
                    'anterior' => $totalSalidasAyer,
                    'delta' => round($totalSalidasHoy - $totalSalidasAyer, 2),
                ],
                'reparaciones_pendientes' => [
                    'actual' => $reparacionesPendientes,
                    'anterior' => $reparacionesPendientesAyer,
                    'delta' => $reparacionesPendientes - $reparacionesPendientesAyer,
                ],
            ],
            'actividad_reciente' => $actividadReciente,
            'generated_at' => now(),
        ];
    }

    private function buildRecentActivity(): array
    {
        $ventas = DB::table('ventas as v')
            ->leftJoin('modulos as m', 'm.id', '=', 'v.modulo_id')
            ->selectRaw("
                'venta' as tipo,
                v.id as entidad_id,
                v.numero_venta as titulo,
                COALESCE(m.nombre, 'General') as contexto,
                v.total as monto,
                v.fecha_venta as fecha,
                CONCAT('Venta registrada por ', v.metodo_pago) as descripcion
            ")
            ->orderByDesc('v.fecha_venta')
            ->limit(3)
            ->get();

        $movimientos = DB::table('movimientos_caja as mc')
            ->leftJoin('modulos as m', 'm.id', '=', 'mc.modulo_id')
            ->selectRaw("
                'caja' as tipo,
                mc.id as entidad_id,
                mc.concepto as titulo,
                COALESCE(m.nombre, 'Caja general') as contexto,
                mc.monto as monto,
                mc.fecha_movimiento as fecha,
                CONCAT(mc.tipo_movimiento, ' / ', mc.categoria_movimiento) as descripcion
            ")
            ->orderByDesc('mc.fecha_movimiento')
            ->limit(3)
            ->get();

        $reparaciones = DB::table('reparaciones as r')
            ->leftJoin('modulos as m', 'm.id', '=', 'r.modulo_id')
            ->selectRaw("
                'reparacion' as tipo,
                r.id as entidad_id,
                r.codigo_reparacion as titulo,
                COALESCE(m.nombre, 'Taller') as contexto,
                r.costo_reparacion as monto,
                r.fecha_ingreso as fecha,
                CONCAT(r.marca, ' ', r.modelo, ' / ', r.estado_reparacion) as descripcion
            ")
            ->orderByDesc('r.fecha_ingreso')
            ->limit(3)
            ->get();

        $productos = DB::table('productos as p')
            ->leftJoin('modulos as m', 'm.id', '=', 'p.modulo_id')
            ->selectRaw("
                'producto' as tipo,
                p.id as entidad_id,
                p.nombre as titulo,
                COALESCE(m.nombre, 'Inventario') as contexto,
                p.precio_venta as monto,
                p.created_at as fecha,
                CONCAT(p.codigo, ' / Stock ', p.stock) as descripcion
            ")
            ->orderByDesc('p.created_at')
            ->limit(3)
            ->get();

        return collect()
            ->merge($ventas)
            ->merge($movimientos)
            ->merge($reparaciones)
            ->merge($productos)
            ->filter(fn (object $row): bool => filled($row->fecha))
            ->sortByDesc('fecha')
            ->take(8)
            ->values()
            ->map(fn (object $row): array => [
                'tipo' => $row->tipo,
                'entidad_id' => (int) $row->entidad_id,
                'titulo' => $row->titulo,
                'contexto' => $row->contexto,
                'monto' => round((float) ($row->monto ?? 0), 2),
                'fecha' => $row->fecha,
                'descripcion' => $row->descripcion,
            ])
            ->all();
    }
}
