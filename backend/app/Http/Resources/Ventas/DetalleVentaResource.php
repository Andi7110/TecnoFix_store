<?php

namespace App\Http\Resources\Ventas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetalleVentaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'venta_id' => $this->venta_id,
            'producto_id' => $this->producto_id,
            'descripcion_item' => $this->descripcion_item,
            'cantidad' => $this->cantidad,
            'precio_unitario' => $this->precio_unitario,
            'costo_unitario' => $this->costo_unitario,
            'subtotal' => $this->subtotal,
            'ganancia_item' => $this->ganancia_item,
            'producto' => $this->whenLoaded('producto', fn (): ?array => $this->producto ? [
                'id' => $this->producto->id,
                'codigo' => $this->producto->codigo,
                'nombre' => $this->producto->nombre,
                'unidad_medida' => $this->producto->unidad_medida,
            ] : null),
        ];
    }
}
