<?php

namespace App\Http\Resources\CuentasPorCobrar;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbonoCuentaPorCobrarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cuenta_por_cobrar_id' => $this->cuenta_por_cobrar_id,
            'movimiento_caja_id' => $this->movimiento_caja_id,
            'monto' => $this->monto,
            'fecha_abono' => $this->fecha_abono?->format('Y-m-d H:i:s'),
            'metodo_pago' => $this->metodo_pago,
            'referencia' => $this->referencia,
            'observacion' => $this->observacion,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
