<?php

namespace App\Http\Resources\Ventas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VentaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'modulo_id' => $this->modulo_id,
            'numero_venta' => $this->numero_venta,
            'fecha_venta' => $this->fecha_venta,
            'subtotal' => $this->subtotal,
            'descuento' => $this->descuento,
            'total' => $this->total,
            'metodo_pago' => $this->metodo_pago,
            'observacion' => $this->observacion,
            'detalles_count' => $this->whenCounted('detalles'),
            'modulo' => $this->whenLoaded('modulo', fn (): array => [
                'id' => $this->modulo->id,
                'nombre' => $this->modulo->nombre,
                'estado' => $this->modulo->estado,
            ]),
            'detalles' => DetalleVentaResource::collection($this->whenLoaded('detalles')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
