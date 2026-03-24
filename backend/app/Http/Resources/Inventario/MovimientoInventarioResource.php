<?php

namespace App\Http\Resources\Inventario;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovimientoInventarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'producto_id' => $this->producto_id,
            'tipo_movimiento' => $this->tipo_movimiento,
            'cantidad' => $this->cantidad,
            'stock_anterior' => $this->stock_anterior,
            'stock_nuevo' => $this->stock_nuevo,
            'motivo' => $this->motivo,
            'referencia' => $this->referencia,
            'fecha_movimiento' => $this->fecha_movimiento,
            'observacion' => $this->observacion,
            'producto' => $this->whenLoaded('producto', fn (): array => [
                'id' => $this->producto->id,
                'modulo_id' => $this->producto->modulo_id,
                'categoria_id' => $this->producto->categoria_id,
                'codigo' => $this->producto->codigo,
                'nombre' => $this->producto->nombre,
                'stock' => $this->producto->stock,
                'stock_minimo' => $this->producto->stock_minimo,
                'estado' => $this->producto->estado,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
