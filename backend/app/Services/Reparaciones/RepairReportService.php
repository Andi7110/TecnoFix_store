<?php

namespace App\Services\Reparaciones;

use App\Models\ReporteFinanciero;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class RepairReportService
{
    public function getDailyReport(array $filters): array
    {
        $day = Carbon::parse($filters['fecha'] ?? now())->startOfDay();
        $start = $day->copy();
        $end = $day->copy()->endOfDay();
        $moduleId = $filters['modulo_id'] ?? null;

        return [
            'fecha' => $day->toDateString(),
            'modulo' => $this->resolveModule($moduleId),
            'resumen' => $this->buildSummary($start, $end, $moduleId),
            'estado_actual' => $this->getCurrentStatusBreakdown($moduleId),
            'reparaciones_por_estado' => $this->getPeriodStatusBreakdown($start, $end, $moduleId),
            'ingresos_por_modulo' => $this->getRepairIncomeByModule($start, $end, $moduleId),
            'costos_por_tipo' => $this->getRepairCostsByType($start, $end, $moduleId),
            'entregas_recientes' => $this->getDeliveredRepairs($start, $end, $moduleId),
            'generated_at' => now(),
        ];
    }

    public function getMonthlyReport(array $filters): array
    {
        $year = (int) ($filters['anio'] ?? now()->year);
        $month = (int) ($filters['mes'] ?? now()->month);
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $moduleId = $filters['modulo_id'] ?? null;
        $summary = $this->buildSummary($start, $end, $moduleId);

        return [
            'periodo' => [
                'anio' => $year,
                'mes' => $month,
                'etiqueta' => $start->locale('es')->translatedFormat('F \\d\\e Y'),
                'inicio' => $start->toDateString(),
                'fin' => $end->toDateString(),
            ],
            'modulo' => $this->resolveModule($moduleId),
            'resumen' => $summary,
            'estado_actual' => $this->getCurrentStatusBreakdown($moduleId),
            'reparaciones_por_estado' => $this->getPeriodStatusBreakdown($start, $end, $moduleId),
            'ingresos_por_dia' => $this->getRepairIncomeByDay($start, $end, $moduleId),
            'ingresos_por_modulo' => $this->getRepairIncomeByModule($start, $end, $moduleId),
            'costos_por_dia' => $this->getRepairCostsByDay($start, $end, $moduleId),
            'costos_por_tipo' => $this->getRepairCostsByType($start, $end, $moduleId),
            'notas' => [
                'Los ingresos se calculan desde caja con categoria reparacion.',
                'Los costos se calculan desde los costos registrados en cada reparacion.',
                'Las reparaciones ingresadas se calculan por fecha_ingreso.',
                'Las entregas se calculan por fecha_entrega y estado entregado.',
            ],
            'generated_at' => now(),
        ];
    }

    public function storeDailyReport(array $filters, ?User $user = null): ReporteFinanciero
    {
        $report = $this->getDailyReport($filters);

        return ReporteFinanciero::query()->create([
            'tipo_reporte' => 'diario_reparaciones',
            'titulo' => 'Reporte diario de reparaciones '.$report['fecha'],
            'modulo_id' => data_get($report, 'modulo.id'),
            'generado_por' => $user?->id,
            'fecha_reporte' => $report['fecha'],
            'anio' => Carbon::parse($report['fecha'])->year,
            'mes' => Carbon::parse($report['fecha'])->month,
            'payload' => $report,
        ])->load(['modulo:id,nombre,estado', 'generadoPor:id,name,username,email']);
    }

    public function storeMonthlyReport(array $filters, ?User $user = null): ReporteFinanciero
    {
        $report = $this->getMonthlyReport($filters);

        return ReporteFinanciero::query()->create([
            'tipo_reporte' => 'mensual_reparaciones',
            'titulo' => 'Reporte mensual de reparaciones '.$report['periodo']['etiqueta'],
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
            ->whereIn('tipo_reporte', ['diario_reparaciones', 'mensual_reparaciones'])
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

    private function buildSummary(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        $created = $this->repairsBaseQuery($moduleId)
            ->whereBetween('fecha_ingreso', [$start, $end])
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('COALESCE(SUM(costo_reparacion), 0) as valor_estimado')
            ->selectRaw('COALESCE(AVG(costo_reparacion), 0) as ticket_promedio')
            ->first();

        $delivered = $this->repairsBaseQuery($moduleId)
            ->where('estado_reparacion', 'entregado')
            ->whereBetween('fecha_entrega', [$start, $end])
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('COALESCE(SUM(costo_reparacion), 0) as valor')
            ->selectRaw('COALESCE(AVG(TIMESTAMPDIFF(HOUR, fecha_ingreso, fecha_entrega)), 0) as horas_promedio')
            ->first();

        $income = $this->repairCashBaseQuery($start, $end, $moduleId)
            ->selectRaw('COUNT(*) as movimientos')
            ->selectRaw('COALESCE(SUM(monto), 0) as total')
            ->first();

        $costs = $this->repairCostsBaseQuery($start, $end, $moduleId)
            ->selectRaw('COUNT(costos_reparacion.id) as movimientos')
            ->selectRaw('COALESCE(SUM(costos_reparacion.monto), 0) as total')
            ->first();

        $openBalance = $this->repairsBaseQuery($moduleId)
            ->where('saldo_pendiente', '>', 0)
            ->sum('saldo_pendiente');

        $cancelled = $this->repairsBaseQuery($moduleId)
            ->where('estado_reparacion', 'cancelado')
            ->whereBetween('updated_at', [$start, $end])
            ->count();

        $incomeTotal = round((float) ($income->total ?? 0), 2);
        $costsTotal = round((float) ($costs->total ?? 0), 2);
        $profit = round($incomeTotal - $costsTotal, 2);

        return [
            'ingresadas' => (int) ($created->total ?? 0),
            'valor_estimado' => round((float) ($created->valor_estimado ?? 0), 2),
            'ticket_promedio' => round((float) ($created->ticket_promedio ?? 0), 2),
            'entregadas' => (int) ($delivered->total ?? 0),
            'valor_entregado' => round((float) ($delivered->valor ?? 0), 2),
            'horas_promedio_entrega' => round((float) ($delivered->horas_promedio ?? 0), 1),
            'ingresos_caja' => $incomeTotal,
            'movimientos_caja' => (int) ($income->movimientos ?? 0),
            'costos_reparacion' => $costsTotal,
            'movimientos_costos' => (int) ($costs->movimientos ?? 0),
            'utilidad_reparaciones' => $profit,
            'margen_utilidad_porcentaje' => $incomeTotal > 0 ? round(($profit / $incomeTotal) * 100, 2) : 0,
            'saldo_pendiente_abierto' => round((float) $openBalance, 2),
            'canceladas' => (int) $cancelled,
        ];
    }

    private function getCurrentStatusBreakdown(int|string|null $moduleId): array
    {
        return $this->repairsBaseQuery($moduleId)
            ->select('estado_reparacion')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('COALESCE(SUM(saldo_pendiente), 0) as saldo_pendiente')
            ->groupBy('estado_reparacion')
            ->orderBy('estado_reparacion')
            ->get()
            ->map(fn (object $row): array => [
                'estado' => $row->estado_reparacion,
                'total' => (int) $row->total,
                'saldo_pendiente' => round((float) $row->saldo_pendiente, 2),
            ])
            ->all();
    }

    private function getPeriodStatusBreakdown(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        return $this->repairsBaseQuery($moduleId)
            ->whereBetween('fecha_ingreso', [$start, $end])
            ->select('estado_reparacion')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('COALESCE(SUM(costo_reparacion), 0) as valor')
            ->groupBy('estado_reparacion')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'estado' => $row->estado_reparacion,
                'total' => (int) $row->total,
                'valor' => round((float) $row->valor, 2),
            ])
            ->all();
    }

    private function getRepairIncomeByDay(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        return $this->repairCashBaseQuery($start, $end, $moduleId)
            ->selectRaw('DATE(fecha_movimiento) as fecha')
            ->selectRaw('COUNT(*) as movimientos')
            ->selectRaw('COALESCE(SUM(monto), 0) as total')
            ->groupByRaw('DATE(fecha_movimiento)')
            ->orderBy('fecha')
            ->get()
            ->map(fn (object $row): array => [
                'fecha' => $row->fecha,
                'movimientos' => (int) $row->movimientos,
                'total' => round((float) $row->total, 2),
            ])
            ->all();
    }

    private function getRepairIncomeByModule(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        return $this->repairCashBaseQuery($start, $end, $moduleId)
            ->leftJoin('modulos as m', 'm.id', '=', 'movimientos_caja.modulo_id')
            ->selectRaw("movimientos_caja.modulo_id, COALESCE(m.nombre, 'Sin modulo') as modulo_nombre")
            ->selectRaw('COUNT(movimientos_caja.id) as movimientos')
            ->selectRaw('COALESCE(SUM(movimientos_caja.monto), 0) as total')
            ->groupBy('movimientos_caja.modulo_id', 'm.nombre')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'modulo_id' => $row->modulo_id ? (int) $row->modulo_id : null,
                'modulo_nombre' => $row->modulo_nombre,
                'movimientos' => (int) $row->movimientos,
                'total' => round((float) $row->total, 2),
            ])
            ->all();
    }

    private function getRepairCostsByDay(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        return $this->repairCostsBaseQuery($start, $end, $moduleId)
            ->selectRaw('DATE(costos_reparacion.fecha_costo) as fecha')
            ->selectRaw('COUNT(costos_reparacion.id) as movimientos')
            ->selectRaw('COALESCE(SUM(costos_reparacion.monto), 0) as total')
            ->groupByRaw('DATE(costos_reparacion.fecha_costo)')
            ->orderBy('fecha')
            ->get()
            ->map(fn (object $row): array => [
                'fecha' => $row->fecha,
                'movimientos' => (int) $row->movimientos,
                'total' => round((float) $row->total, 2),
            ])
            ->all();
    }

    private function getRepairCostsByType(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        return $this->repairCostsBaseQuery($start, $end, $moduleId)
            ->select('costos_reparacion.tipo_costo')
            ->selectRaw('COUNT(costos_reparacion.id) as movimientos')
            ->selectRaw('COALESCE(SUM(costos_reparacion.monto), 0) as total')
            ->groupBy('costos_reparacion.tipo_costo')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'tipo_costo' => $row->tipo_costo,
                'movimientos' => (int) $row->movimientos,
                'total' => round((float) $row->total, 2),
            ])
            ->all();
    }

    private function getDeliveredRepairs(Carbon $start, Carbon $end, int|string|null $moduleId): array
    {
        return $this->repairsBaseQuery($moduleId)
            ->leftJoin('clientes as c', 'c.id', '=', 'reparaciones.cliente_id')
            ->where('estado_reparacion', 'entregado')
            ->whereBetween('fecha_entrega', [$start, $end])
            ->select([
                'reparaciones.codigo_reparacion',
                'reparaciones.marca',
                'reparaciones.modelo',
                'reparaciones.costo_reparacion',
                'reparaciones.fecha_entrega',
                'c.nombre as cliente_nombre',
            ])
            ->orderByDesc('fecha_entrega')
            ->limit(8)
            ->get()
            ->map(fn (object $row): array => [
                'codigo_reparacion' => $row->codigo_reparacion,
                'cliente_nombre' => $row->cliente_nombre,
                'equipo' => trim($row->marca.' '.$row->modelo),
                'costo_reparacion' => round((float) $row->costo_reparacion, 2),
                'fecha_entrega' => $row->fecha_entrega,
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

    private function repairsBaseQuery(int|string|null $moduleId): Builder
    {
        $query = DB::table('reparaciones');

        if (filled($moduleId)) {
            $query->where('reparaciones.modulo_id', $moduleId);
        }

        return $query;
    }

    private function repairCashBaseQuery(Carbon $start, Carbon $end, int|string|null $moduleId): Builder
    {
        $query = DB::table('movimientos_caja')
            ->where('tipo_movimiento', 'entrada')
            ->where('categoria_movimiento', 'reparacion')
            ->whereBetween('fecha_movimiento', [$start, $end]);

        if (filled($moduleId)) {
            $query->where('movimientos_caja.modulo_id', $moduleId);
        }

        return $query;
    }

    private function repairCostsBaseQuery(Carbon $start, Carbon $end, int|string|null $moduleId): Builder
    {
        $query = DB::table('costos_reparacion')
            ->join('reparaciones', 'reparaciones.id', '=', 'costos_reparacion.reparacion_id')
            ->whereBetween('costos_reparacion.fecha_costo', [$start, $end]);

        if (filled($moduleId)) {
            $query->where('reparaciones.modulo_id', $moduleId);
        }

        return $query;
    }
}
