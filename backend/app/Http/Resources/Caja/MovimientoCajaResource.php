<?php

namespace App\Http\Resources\Caja;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovimientoCajaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'modulo_id' => $this->modulo_id,
            'tipo_movimiento' => $this->tipo_movimiento,
            'categoria_movimiento' => $this->categoria_movimiento,
            'concepto' => $this->concepto,
            'monto' => $this->monto,
            'fecha_movimiento' => $this->fecha_movimiento,
            'referencia' => $this->referencia,
            'observacion' => $this->observacion,
            'modulo' => $this->whenLoaded('modulo', fn (): ?array => $this->modulo ? [
                'id' => $this->modulo->id,
                'nombre' => $this->modulo->nombre,
                'estado' => $this->modulo->estado,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
