<?php

namespace App\Http\Resources\Dashboard;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $summary = $this->resource;

        return [
            'today' => [
                'total_vendido' => data_get($summary, 'today.total_vendido', 0),
                'total_entradas' => data_get($summary, 'today.total_entradas', 0),
                'total_salidas' => data_get($summary, 'today.total_salidas', 0),
                'productos_stock_bajo' => data_get($summary, 'today.productos_stock_bajo', 0),
                'reparaciones_pendientes' => data_get($summary, 'today.reparaciones_pendientes', 0),
            ],
            'ventas_por_modulo' => data_get($summary, 'ventas_por_modulo', []),
            'resumen_dia' => [
                'fecha' => data_get($summary, 'resumen_dia.fecha'),
                'balance_caja' => data_get($summary, 'resumen_dia.balance_caja', 0),
                'modulos_con_ventas' => data_get($summary, 'resumen_dia.modulos_con_ventas', 0),
            ],
            'generated_at' => data_get($summary, 'generated_at'),
        ];
    }
}
