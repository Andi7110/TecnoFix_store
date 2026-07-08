<?php

namespace App\Http\Resources\CuentasPorCobrar;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CuentaPorCobrarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'venta_id' => $this->venta_id,
            'cliente_id' => $this->cliente_id,
            'modulo_id' => $this->modulo_id,
            'codigo' => $this->codigo,
            'cliente_nombre' => $this->cliente_nombre,
            'cliente_telefono' => $this->cliente_telefono,
            'monto_original' => $this->monto_original,
            'monto_pagado' => $this->monto_pagado,
            'saldo_pendiente' => $this->saldo_pendiente,
            'fecha_cuenta' => $this->fecha_cuenta?->format('Y-m-d H:i:s'),
            'fecha_promesa_pago' => $this->fecha_promesa_pago?->format('Y-m-d'),
            'estado' => $this->estado,
            'motivo' => $this->motivo,
            'observacion' => $this->observacion,
            'venta' => $this->whenLoaded('venta', fn (): ?array => $this->venta ? [
                'id' => $this->venta->id,
                'numero_venta' => $this->venta->numero_venta,
                'total' => $this->venta->total,
            ] : null),
            'modulo' => $this->whenLoaded('modulo', fn (): ?array => $this->modulo ? [
                'id' => $this->modulo->id,
                'nombre' => $this->modulo->nombre,
            ] : null),
            'abonos' => AbonoCuentaPorCobrarResource::collection($this->whenLoaded('abonos')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
