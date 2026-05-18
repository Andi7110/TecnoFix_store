<?php

namespace App\Http\Resources\Reparaciones;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CostoReparacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reparacion_id' => $this->reparacion_id,
            'movimiento_caja_id' => $this->movimiento_caja_id,
            'tipo_costo' => $this->tipo_costo,
            'descripcion' => $this->descripcion,
            'monto' => $this->monto,
            'fecha_costo' => $this->fecha_costo,
            'proveedor' => $this->proveedor,
            'referencia' => $this->referencia,
            'observacion' => $this->observacion,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
