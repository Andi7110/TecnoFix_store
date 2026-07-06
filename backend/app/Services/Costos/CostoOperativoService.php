<?php

namespace App\Services\Costos;

use App\Models\CostoOperativo;
use App\Models\MovimientoCaja;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CostoOperativoService
{
    public function paginate(array $filters): array
    {
        $perPage = min(max((int) ($filters['per_page'] ?? 10), 1), 100);

        $query = CostoOperativo::query()
            ->with(['modulo:id,nombre,estado', 'producto:id,codigo,nombre', 'registradoPor:id,name,username'])
            ->porFecha($filters['fecha_desde'] ?? null, $filters['fecha_hasta'] ?? null)
            ->when(filled($filters['categoria'] ?? null), fn ($query) => $query->where('categoria', $filters['categoria']))
            ->when(filled($filters['tipo_costo'] ?? null), fn ($query) => $query->where('tipo_costo', $filters['tipo_costo']))
            ->when(filled($filters['modulo_id'] ?? null), fn ($query) => $query->where('modulo_id', $filters['modulo_id']))
            ->when(filled($filters['producto_id'] ?? null), fn ($query) => $query->where('producto_id', $filters['producto_id']));

        $summary = $this->buildSummary($filters);

        return [
            'costos' => $query->orderByDesc('fecha_costo')->orderByDesc('id')->paginate($perPage)->withQueryString(),
            'summary' => $summary,
        ];
    }

    public function store(array $data, ?int $userId = null): CostoOperativo
    {
        return DB::transaction(function () use ($data, $userId): CostoOperativo {
            $monto = round((float) $data['monto'], 2);
            $cantidadDistribucion = filled($data['cantidad_distribucion'] ?? null)
                ? (int) $data['cantidad_distribucion']
                : null;
            $registrarEnCaja = (bool) ($data['registrar_en_caja'] ?? true);
            $costoUnitario = $cantidadDistribucion ? round($monto / $cantidadDistribucion, 2) : null;
            $movimientoCaja = null;

            if ($registrarEnCaja) {
                $movimientoCaja = MovimientoCaja::query()->create([
                    'modulo_id' => $data['modulo_id'] ?? null,
                    'tipo_movimiento' => 'salida',
                    'categoria_movimiento' => $data['categoria'] === 'alquiler' ? 'costo_fijo' : 'gasto',
                    'concepto' => $data['concepto'],
                    'monto' => $monto,
                    'fecha_movimiento' => Carbon::parse($data['fecha_costo'])->startOfDay(),
                    'referencia' => 'costo-operativo',
                    'observacion' => $data['observacion'] ?? null,
                ]);
            }

            return CostoOperativo::query()->create([
                'modulo_id' => $data['modulo_id'] ?? null,
                'producto_id' => $data['producto_id'] ?? null,
                'movimiento_caja_id' => $movimientoCaja?->id,
                'registrado_por' => $userId,
                'concepto' => $data['concepto'],
                'categoria' => $data['categoria'],
                'tipo_costo' => $data['tipo_costo'],
                'frecuencia' => $data['frecuencia'],
                'monto' => $monto,
                'fecha_costo' => Carbon::parse($data['fecha_costo'])->toDateString(),
                'cantidad_distribucion' => $cantidadDistribucion,
                'costo_unitario_estimado' => $costoUnitario,
                'registrar_en_caja' => $registrarEnCaja,
                'observacion' => $data['observacion'] ?? null,
            ])->load(['modulo:id,nombre,estado', 'producto:id,codigo,nombre', 'registradoPor:id,name,username']);
        });
    }

    public function buildSummary(array $filters = []): array
    {
        $start = filled($filters['fecha_desde'] ?? null)
            ? Carbon::parse($filters['fecha_desde'])->startOfDay()
            : now()->startOfDay();
        $end = filled($filters['fecha_hasta'] ?? null)
            ? Carbon::parse($filters['fecha_hasta'])->endOfDay()
            : now()->endOfDay();
        $moduleId = $filters['modulo_id'] ?? null;

        $base = CostoOperativo::query()
            ->whereBetween('fecha_costo', [$start->toDateString(), $end->toDateString()])
            ->when(filled($moduleId), fn ($query) => $query->where('modulo_id', $moduleId));

        $totalCostos = round((float) (clone $base)->sum('monto'), 2);
        $porCategoria = (clone $base)
            ->select('categoria')
            ->selectRaw('COUNT(*) as costos_count')
            ->selectRaw('COALESCE(SUM(monto), 0) as total')
            ->groupBy('categoria')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'categoria' => $row->categoria,
                'costos_count' => (int) $row->costos_count,
                'total' => round((float) $row->total, 2),
            ])
            ->all();

        $sales = DB::table('ventas')
            ->whereBetween('fecha_venta', [$start, $end])
            ->when(filled($moduleId), fn ($query) => $query->where('modulo_id', $moduleId))
            ->selectRaw('COALESCE(SUM(total), 0) as ventas_netas')
            ->first();

        $details = DB::table('detalle_ventas as dv')
            ->join('ventas as v', 'v.id', '=', 'dv.venta_id')
            ->whereBetween('v.fecha_venta', [$start, $end])
            ->when(filled($moduleId), fn ($query) => $query->where('v.modulo_id', $moduleId))
            ->selectRaw('COALESCE(SUM(dv.costo_unitario * dv.cantidad), 0) as costo_ventas')
            ->selectRaw('COALESCE(SUM(dv.ganancia_item), 0) as utilidad_bruta')
            ->first();

        $ventasNetas = round((float) ($sales->ventas_netas ?? 0), 2);
        $costoVentas = round((float) ($details->costo_ventas ?? 0), 2);
        $utilidadBruta = round((float) ($details->utilidad_bruta ?? 0), 2);
        $utilidadNeta = round($utilidadBruta - $totalCostos, 2);

        return [
            'periodo' => [
                'inicio' => $start->toDateString(),
                'fin' => $end->toDateString(),
            ],
            'ventas_netas' => $ventasNetas,
            'costo_ventas' => $costoVentas,
            'utilidad_bruta' => $utilidadBruta,
            'costos_operativos' => $totalCostos,
            'utilidad_neta' => $utilidadNeta,
            'margen_neto_porcentaje' => $ventasNetas > 0 ? round(($utilidadNeta / $ventasNetas) * 100, 2) : 0,
            'por_categoria' => $porCategoria,
        ];
    }
}
