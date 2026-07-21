<?php

namespace App\Http\Resources\Costos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CostoOperativoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'modulo_id' => $this->modulo_id,
            'producto_id' => $this->producto_id,
            'movimiento_caja_id' => $this->movimiento_caja_id,
            'concepto' => $this->concepto,
            'categoria' => $this->categoria,
            'tipo_costo' => $this->tipo_costo,
            'frecuencia' => $this->frecuencia,
            'monto' => $this->monto,
            'fecha_costo' => $this->fecha_costo?->toDateString(),
            'cantidad_distribucion' => $this->cantidad_distribucion,
            'costo_unitario_estimado' => $this->costo_unitario_estimado,
            'registrar_en_caja' => $this->registrar_en_caja,
            'observacion' => $this->observacion,
            'comprobantes' => $this->whenLoaded('comprobantes', fn () => $this->comprobantes->map(fn ($comprobante): array => [
                'id' => $comprobante->id,
                'nombre_original' => $comprobante->nombre_original,
                'mime_type' => $comprobante->mime_type,
                'archivo_url' => route('caja.comprobantes.archivo', ['comprobante' => $comprobante->id]),
            ])),
            'modulo' => $this->whenLoaded('modulo', fn (): ?array => $this->modulo ? [
                'id' => $this->modulo->id,
                'nombre' => $this->modulo->nombre,
            ] : null),
            'producto' => $this->whenLoaded('producto', fn (): ?array => $this->producto ? [
                'id' => $this->producto->id,
                'codigo' => $this->producto->codigo,
                'nombre' => $this->producto->nombre,
            ] : null),
            'registrado_por_usuario' => $this->whenLoaded('registradoPor', fn (): ?array => $this->registradoPor ? [
                'id' => $this->registradoPor->id,
                'name' => $this->registradoPor->name,
                'username' => $this->registradoPor->username,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
