<?php

namespace App\Services\Ventas;

use App\Models\ReporteFinanciero;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SalesReportService
{
    private const OPERATING_EXPENSE_CATEGORIES = ['gasto', 'costo_fijo'];
    private const OTHER_INCOME_CATEGORIES = ['reparacion', 'ingreso_manual'];
    private const EXCLUDED_CASH_CATEGORIES = ['retiro', 'ajuste_caja', 'compra_productos'];

    public function getDailyReport(array $filters): array
    {
        $day = Carbon::parse($filters['fecha'] ?? now())->startOfDay();
        $start = $day->copy();
        $end = $day->copy()->endOfDay();
        $module = $this->resolveModule($filters['modulo_id'] ?? null);

        $salesSummary = $this->buildSalesSummary($start, $end, $filters['modulo_id'] ?? null);
        $cashSummary = $this->buildCashSummary($start, $end, $filters['modulo_id'] ?? null);

        return [
            'fecha' => $day->toDateString(),
            'modulo' => $module,
            'resumen' => $salesSummary,
            'ventas_por_metodo' => $this->getSalesByPaymentMethod($start, $end, $filters['modulo_id'] ?? null),
            'ventas_por_modulo' => $this->getSalesByModule($start, $end, $filters['modulo_id'] ?? null),
            'top_productos' => $this->getTopProducts($start, $end, $filters['modulo_id'] ?? null),
            'caja' => $cashSummary,
            'generated_at' => now(),
        ];
    }

    public function getMonthlyIncomeStatement(array $filters): array
    {
        $year = (int) ($filters['anio'] ?? now()->year);
        $month = (int) ($filters['mes'] ?? now()->month);
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $moduleId = $filters['modulo_id'] ?? null;
        $module = $this->resolveModule($moduleId);

        $salesSummary = $this->buildSalesSummary($start, $end, $moduleId);
        $otherIncome = $this->sumCashMovementsByType($start, $end, $moduleId, 'entrada', self::OTHER_INCOME_CATEGORIES);
        $operatingExpenses = $this->sumCashMovementsByType($start, $end, $moduleId, 'salida', self::OPERATING_EXPENSE_CATEGORIES);
        $cashSummary = $this->buildCashSummary($start, $end, $moduleId);
        $operatingRevenue = round($salesSummary['ventas_netas'] + $otherIncome, 2);
        $grossProfit = round($operatingRevenue - $salesSummary['costo_ventas'], 2);
        $operatingProfit = round($grossProfit - $operatingExpenses, 2);

        return [
            'periodo' => [
                'anio' => $year,
                'mes' => $month,
                'etiqueta' => $start->locale('es')->translatedFormat('F \\d\\e Y'),
                'inicio' => $start->toDateString(),
                'fin' => $end->toDateString(),
            ],
            'modulo' => $module,
            'estado_resultados' => [
                'ventas_netas' => $salesSummary['ventas_netas'],
                'otros_ingresos' => $otherIncome,
                'ingresos_operativos' => $operatingRevenue,
                'costo_ventas' => $salesSummary['costo_ventas'],
                'utilidad_bruta' => $grossProfit,
                'gastos_operativos' => $operatingExpenses,
                'utilidad_operativa' => $operatingProfit,
                'margen_operativo_porcentaje' => $operatingRevenue > 0
                    ? round(($operatingProfit / $operatingRevenue) * 100, 2)
                    : 0,
            ],
            'detalle_gastos_operativos' => $this->getCashBreakdown($start, $end, $moduleId, 'salida', self::OPERATING_EXPENSE_CATEGORIES),
            'movimientos_excluidos' => $this->getExcludedCashBreakdown($start, $end, $moduleId),
            'resumen_caja' => $cashSummary,
            'notas' => [
                'El costo de ventas se calcula desde los detalles vendidos usando costo_unitario.',
                'Los gastos operativos incluyen solo categorias de caja marcadas como gasto o costo_fijo.',
                'Retiros, ajustes de caja y compras de inventario se muestran aparte para no distorsionar la utilidad operativa.',
            ],
            'generated_at' => now(),
        ];
    }

    public function storeDailyReport(array $filters, ?User $user = null): ReporteFinanciero
    {
        $report = $this->getDailyReport($filters);

        return ReporteFinanciero::query()->create([
            'tipo_reporte' => 'diario_ventas',
            'titulo' => 'Reporte diario de ventas '.$report['fecha'],
            'modulo_id' => data_get($report, 'modulo.id'),
            'generado_por' => $user?->id,
            'fecha_reporte' => $report['fecha'],
            'anio' => Carbon::parse($report['fecha'])->year,
            'mes' => Carbon::parse($report['fecha'])->month,
            'payload' => $report,
        ])->load(['modulo:id,nombre,estado', 'generadoPor:id,name,username,email']);
    }

    public function storeMonthlyIncomeStatement(array $filters, ?User $user = null): ReporteFinanciero
    {
        $report = $this->getMonthlyIncomeStatement($filters);

        return ReporteFinanciero::query()->create([
            'tipo_reporte' => 'estado_resultados_mensual',
            'titulo' => 'Estado de resultados '.$report['periodo']['etiqueta'],
            'modulo_id' => data_get($report, 'modulo.id'),
            'generado_por' => $user?->id,
            'fecha_reporte' => data_get($report, 'periodo.inicio'),
            'anio' => data_get($report, 'periodo.anio'),
            'mes' => data_get($report, 'periodo.mes'),
            'payload' => $report,
        ])->load(['modulo:id,nombre,estado', 'generadoPor:id,name,username,email']);
    }

    public function getHistory(array $filters): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 10);

        return ReporteFinanciero::query()
            ->with([
                'modulo:id,nombre,estado',
                'generadoPor:id,name,username,email',
            ])
            ->when(filled($filters['tipo_reporte'] ?? null), function ($query) use ($filters): void {
                $query->where('tipo_reporte', $filters['tipo_reporte']);
            })
            ->when(filled($filters['modulo_id'] ?? null), function ($query) use ($filters): void {
                $query->where('modulo_id', $filters['modulo_id']);
            })
            ->orderByDesc('created_at')
            ->paginate(min(max($perPage, 1), 50))
            ->withQueryString();
    }

    private function buildSalesSummary(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        $salesTotals = $this->salesBaseQuery($start, $end, $moduleId)
            ->selectRaw('COUNT(*) as ventas_count')
            ->selectRaw('COALESCE(SUM(subtotal), 0) as subtotal')
            ->selectRaw('COALESCE(SUM(descuento), 0) as descuento')
            ->selectRaw('COALESCE(SUM(total), 0) as ventas_netas')
            ->first();

        $detailTotals = $this->salesDetailBaseQuery($start, $end, $moduleId)
            ->selectRaw('COALESCE(SUM(dv.cantidad), 0) as items_vendidos')
            ->selectRaw('COALESCE(SUM(dv.costo_unitario * dv.cantidad), 0) as costo_ventas')
            ->selectRaw('COALESCE(SUM(dv.ganancia_item), 0) as utilidad_bruta')
            ->first();

        $ventasCount = (int) ($salesTotals->ventas_count ?? 0);
        $ventasNetas = round((float) ($salesTotals->ventas_netas ?? 0), 2);
        $grossProfit = round((float) ($detailTotals->utilidad_bruta ?? 0), 2);

        return [
            'ventas_count' => $ventasCount,
            'items_vendidos' => (int) ($detailTotals->items_vendidos ?? 0),
            'subtotal' => round((float) ($salesTotals->subtotal ?? 0), 2),
            'descuento' => round((float) ($salesTotals->descuento ?? 0), 2),
            'ventas_netas' => $ventasNetas,
            'ticket_promedio' => $ventasCount > 0 ? round($ventasNetas / $ventasCount, 2) : 0,
            'costo_ventas' => round((float) ($detailTotals->costo_ventas ?? 0), 2),
            'utilidad_bruta' => $grossProfit,
            'margen_bruto_porcentaje' => $ventasNetas > 0 ? round(($grossProfit / $ventasNetas) * 100, 2) : 0,
        ];
    }

    private function getSalesByPaymentMethod(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        return $this->salesBaseQuery($start, $end, $moduleId)
            ->select('metodo_pago')
            ->selectRaw('COUNT(*) as ventas_count')
            ->selectRaw('COALESCE(SUM(total), 0) as total')
            ->groupBy('metodo_pago')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'metodo_pago' => $row->metodo_pago,
                'ventas_count' => (int) $row->ventas_count,
                'total' => round((float) $row->total, 2),
            ])
            ->all();
    }

    private function getSalesByModule(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        $salesRows = $this->salesBaseQuery($start, $end, $moduleId)
            ->leftJoin('modulos as m', 'm.id', '=', 'ventas.modulo_id')
            ->selectRaw("ventas.modulo_id, COALESCE(m.nombre, 'Sin modulo') as modulo_nombre")
            ->selectRaw('COUNT(ventas.id) as ventas_count')
            ->selectRaw('COALESCE(SUM(ventas.total), 0) as ventas_netas')
            ->groupBy('ventas.modulo_id', 'm.nombre')
            ->orderByDesc('ventas_netas')
            ->get()
            ->keyBy(fn (object $row): string => (string) ($row->modulo_id ?? 0));

        $profitRows = $this->salesDetailBaseQuery($start, $end, $moduleId)
            ->leftJoin('modulos as m', 'm.id', '=', 'v.modulo_id')
            ->selectRaw("v.modulo_id, COALESCE(m.nombre, 'Sin modulo') as modulo_nombre")
            ->selectRaw('COALESCE(SUM(dv.costo_unitario * dv.cantidad), 0) as costo_ventas')
            ->selectRaw('COALESCE(SUM(dv.ganancia_item), 0) as utilidad_bruta')
            ->groupBy('v.modulo_id', 'm.nombre')
            ->get()
            ->keyBy(fn (object $row): string => (string) ($row->modulo_id ?? 0));

        return $salesRows
            ->map(function (object $row) use ($profitRows): array {
                $profit = $profitRows->get((string) ($row->modulo_id ?? 0));

                return [
                    'modulo_id' => $row->modulo_id ? (int) $row->modulo_id : null,
                    'modulo_nombre' => $row->modulo_nombre,
                    'ventas_count' => (int) $row->ventas_count,
                    'ventas_netas' => round((float) $row->ventas_netas, 2),
                    'costo_ventas' => round((float) ($profit->costo_ventas ?? 0), 2),
                    'utilidad_bruta' => round((float) ($profit->utilidad_bruta ?? 0), 2),
                ];
            })
            ->values()
            ->all();
    }

    private function getTopProducts(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        return $this->salesDetailBaseQuery($start, $end, $moduleId)
            ->leftJoin('productos as p', 'p.id', '=', 'dv.producto_id')
            ->selectRaw('dv.producto_id, COALESCE(p.nombre, dv.descripcion_item) as producto_nombre, p.codigo as producto_codigo')
            ->selectRaw('COALESCE(SUM(dv.cantidad), 0) as cantidad')
            ->selectRaw('COALESCE(SUM(dv.subtotal), 0) as total')
            ->selectRaw('COALESCE(SUM(dv.costo_unitario * dv.cantidad), 0) as costo_ventas')
            ->selectRaw('COALESCE(SUM(dv.ganancia_item), 0) as utilidad_bruta')
            ->groupBy('dv.producto_id', 'p.nombre', 'p.codigo', 'dv.descripcion_item')
            ->orderByDesc('cantidad')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn (object $row): array => [
                'producto_id' => $row->producto_id ? (int) $row->producto_id : null,
                'producto_nombre' => $row->producto_nombre,
                'producto_codigo' => $row->producto_codigo,
                'cantidad' => (int) $row->cantidad,
                'total' => round((float) $row->total, 2),
                'costo_ventas' => round((float) $row->costo_ventas, 2),
                'utilidad_bruta' => round((float) $row->utilidad_bruta, 2),
            ])
            ->all();
    }

    private function buildCashSummary(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        $rows = $this->cashBaseQuery($start, $end, $moduleId)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN tipo_movimiento = 'entrada' THEN monto ELSE 0 END), 0) as entradas,
                COALESCE(SUM(CASE WHEN tipo_movimiento = 'salida' THEN monto ELSE 0 END), 0) as salidas
            ")
            ->first();

        $entries = round((float) ($rows->entradas ?? 0), 2);
        $expenses = round((float) ($rows->salidas ?? 0), 2);

        return [
            'entradas' => $entries,
            'salidas' => $expenses,
            'neto' => round($entries - $expenses, 2),
        ];
    }

    private function sumCashMovementsByType(
        Carbon $start,
        Carbon $end,
        int|string|null $moduleId,
        string $type,
        array $categories,
    ): float {
        return round((float) $this->cashBaseQuery($start, $end, $moduleId)
            ->where('tipo_movimiento', $type)
            ->whereIn('categoria_movimiento', $categories)
            ->sum('monto'), 2);
    }

    private function getCashBreakdown(
        Carbon $start,
        Carbon $end,
        int|string|null $moduleId,
        string $type,
        array $categories,
    ): array {
        return $this->cashBaseQuery($start, $end, $moduleId)
            ->where('tipo_movimiento', $type)
            ->whereIn('categoria_movimiento', $categories)
            ->select('categoria_movimiento')
            ->selectRaw('COUNT(*) as movimientos_count')
            ->selectRaw('COALESCE(SUM(monto), 0) as total')
            ->groupBy('categoria_movimiento')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'categoria_movimiento' => $row->categoria_movimiento,
                'movimientos_count' => (int) $row->movimientos_count,
                'total' => round((float) $row->total, 2),
            ])
            ->all();
    }

    private function getExcludedCashBreakdown(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        return $this->cashBaseQuery($start, $end, $moduleId)
            ->whereIn('categoria_movimiento', self::EXCLUDED_CASH_CATEGORIES)
            ->select('tipo_movimiento', 'categoria_movimiento')
            ->selectRaw('COUNT(*) as movimientos_count')
            ->selectRaw('COALESCE(SUM(monto), 0) as total')
            ->groupBy('tipo_movimiento', 'categoria_movimiento')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'tipo_movimiento' => $row->tipo_movimiento,
                'categoria_movimiento' => $row->categoria_movimiento,
                'movimientos_count' => (int) $row->movimientos_count,
                'total' => round((float) $row->total, 2),
            ])
            ->all();
    }

    private function resolveModule(int|string|null $moduleId): ?array
    {
        if (blank($moduleId)) {
            return null;
        }

        $module = DB::table('modulos')
            ->select('id', 'nombre', 'estado')
            ->where('id', $moduleId)
            ->first();

        if (! $module) {
            return null;
        }

        return [
            'id' => (int) $module->id,
            'nombre' => $module->nombre,
            'estado' => (bool) $module->estado,
        ];
    }

    private function salesBaseQuery(Carbon $start, Carbon $end, int|string|null $moduleId): Builder
    {
        $query = DB::table('ventas')
            ->whereBetween('fecha_venta', [$start, $end]);

        if (filled($moduleId)) {
            $query->where('modulo_id', $moduleId);
        }

        return $query;
    }

    private function salesDetailBaseQuery(Carbon $start, Carbon $end, int|string|null $moduleId): Builder
    {
        $query = DB::table('detalle_ventas as dv')
            ->join('ventas as v', 'v.id', '=', 'dv.venta_id')
            ->whereBetween('v.fecha_venta', [$start, $end]);

        if (filled($moduleId)) {
            $query->where('v.modulo_id', $moduleId);
        }

        return $query;
    }

    private function cashBaseQuery(Carbon $start, Carbon $end, int|string|null $moduleId): Builder
    {
        $query = DB::table('movimientos_caja')
            ->whereBetween('fecha_movimiento', [$start, $end]);

        if (filled($moduleId)) {
            $query->where('modulo_id', $moduleId);
        }

        return $query;
    }
}
