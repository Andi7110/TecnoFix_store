<?php

namespace App\Http\Resources\Reparaciones;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReparacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cliente_id' => $this->cliente_id,
            'modulo_id' => $this->modulo_id,
            'codigo_reparacion' => $this->codigo_reparacion,
            'marca' => $this->marca,
            'modelo' => $this->modelo,
            'tipo_equipo' => $this->tipo_equipo,
            'problema_reportado' => $this->problema_reportado,
            'diagnostico' => $this->diagnostico,
            'costo_reparacion' => $this->costo_reparacion,
            'anticipo' => $this->anticipo,
            'saldo_pendiente' => $this->saldo_pendiente,
            'fecha_ingreso' => $this->fecha_ingreso,
            'fecha_estimada_entrega' => $this->fecha_estimada_entrega,
            'fecha_entrega' => $this->fecha_entrega,
            'estado_reparacion' => $this->estado_reparacion,
            'observacion' => $this->observacion,
            'historiales_count' => $this->whenCounted('historiales'),
            'cliente' => new ClienteResource($this->whenLoaded('cliente')),
            'modulo' => $this->whenLoaded('modulo', fn (): ?array => $this->modulo ? [
                'id' => $this->modulo->id,
                'nombre' => $this->modulo->nombre,
                'estado' => $this->modulo->estado,
            ] : null),
            'historiales' => HistorialReparacionResource::collection($this->whenLoaded('historiales')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
