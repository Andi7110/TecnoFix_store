<?php

namespace App\Http\Resources\Ventas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MonthlyIncomeStatementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $report = $this->resource;

        return [
            'periodo' => [
                'anio' => data_get($report, 'periodo.anio'),
                'mes' => data_get($report, 'periodo.mes'),
                'etiqueta' => data_get($report, 'periodo.etiqueta'),
                'inicio' => data_get($report, 'periodo.inicio'),
                'fin' => data_get($report, 'periodo.fin'),
            ],
            'modulo' => data_get($report, 'modulo'),
            'estado_resultados' => [
                'ventas_netas' => data_get($report, 'estado_resultados.ventas_netas', 0),
                'otros_ingresos' => data_get($report, 'estado_resultados.otros_ingresos', 0),
                'ingresos_operativos' => data_get($report, 'estado_resultados.ingresos_operativos', 0),
                'costo_ventas' => data_get($report, 'estado_resultados.costo_ventas', 0),
                'utilidad_bruta' => data_get($report, 'estado_resultados.utilidad_bruta', 0),
                'gastos_operativos' => data_get($report, 'estado_resultados.gastos_operativos', 0),
                'utilidad_operativa' => data_get($report, 'estado_resultados.utilidad_operativa', 0),
                'margen_operativo_porcentaje' => data_get($report, 'estado_resultados.margen_operativo_porcentaje', 0),
            ],
            'detalle_gastos_operativos' => data_get($report, 'detalle_gastos_operativos', []),
            'movimientos_excluidos' => data_get($report, 'movimientos_excluidos', []),
            'resumen_caja' => [
                'entradas' => data_get($report, 'resumen_caja.entradas', 0),
                'salidas' => data_get($report, 'resumen_caja.salidas', 0),
                'neto' => data_get($report, 'resumen_caja.neto', 0),
            ],
            'notas' => data_get($report, 'notas', []),
            'generated_at' => data_get($report, 'generated_at'),
        ];
    }
}
