<?php

namespace App\Http\Resources\Ventas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DailySalesReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $report = $this->resource;

        return [
            'fecha' => data_get($report, 'fecha'),
            'modulo' => data_get($report, 'modulo'),
            'resumen' => [
                'ventas_count' => data_get($report, 'resumen.ventas_count', 0),
                'items_vendidos' => data_get($report, 'resumen.items_vendidos', 0),
                'subtotal' => data_get($report, 'resumen.subtotal', 0),
                'descuento' => data_get($report, 'resumen.descuento', 0),
                'ventas_netas' => data_get($report, 'resumen.ventas_netas', 0),
                'ticket_promedio' => data_get($report, 'resumen.ticket_promedio', 0),
                'costo_ventas' => data_get($report, 'resumen.costo_ventas', 0),
                'utilidad_bruta' => data_get($report, 'resumen.utilidad_bruta', 0),
                'margen_bruto_porcentaje' => data_get($report, 'resumen.margen_bruto_porcentaje', 0),
            ],
            'ventas_por_metodo' => data_get($report, 'ventas_por_metodo', []),
            'ventas_por_modulo' => data_get($report, 'ventas_por_modulo', []),
            'top_productos' => data_get($report, 'top_productos', []),
            'caja' => [
                'entradas' => data_get($report, 'caja.entradas', 0),
                'salidas' => data_get($report, 'caja.salidas', 0),
                'neto' => data_get($report, 'caja.neto', 0),
            ],
            'generated_at' => data_get($report, 'generated_at'),
        ];
    }
}
