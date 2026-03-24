<?php

namespace App\Http\Resources\Reparaciones;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistorialReparacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reparacion_id' => $this->reparacion_id,
            'estado_anterior' => $this->estado_anterior,
            'estado_nuevo' => $this->estado_nuevo,
            'comentario' => $this->comentario,
            'fecha_cambio' => $this->fecha_cambio,
        ];
    }
}
