<?php

namespace App\Actions\Ventas;

use App\Models\MovimientoCaja;
use App\Models\Venta;

class RegistrarMovimientoCajaVentaAction
{
    public function execute(Venta $venta): MovimientoCaja
    {
        return MovimientoCaja::query()->create([
            'modulo_id' => $venta->modulo_id,
            'tipo_movimiento' => 'entrada',
            'categoria_movimiento' => 'venta',
            'concepto' => 'Venta '.$venta->numero_venta,
            'monto' => $venta->total,
            'fecha_movimiento' => $venta->fecha_venta,
            'referencia' => $venta->numero_venta,
            'observacion' => $venta->observacion,
        ]);
    }
}
