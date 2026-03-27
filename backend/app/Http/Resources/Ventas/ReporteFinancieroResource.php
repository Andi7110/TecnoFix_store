<?php

namespace App\Http\Resources\Ventas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReporteFinancieroResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tipo_reporte' => $this->tipo_reporte,
            'titulo' => $this->titulo,
            'fecha_reporte' => optional($this->fecha_reporte)->toDateString(),
            'anio' => $this->anio,
            'mes' => $this->mes,
            'payload' => $this->payload,
            'modulo' => $this->whenLoaded('modulo', fn (): ?array => $this->modulo ? [
                'id' => $this->modulo->id,
                'nombre' => $this->modulo->nombre,
                'estado' => $this->modulo->estado,
            ] : null),
            'generado_por_usuario' => $this->whenLoaded('generadoPor', fn (): ?array => $this->generadoPor ? [
                'id' => $this->generadoPor->id,
                'name' => $this->generadoPor->name,
                'username' => $this->generadoPor->username,
                'email' => $this->generadoPor->email,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
