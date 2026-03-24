<?php

namespace App\Http\Resources\Inventario;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'categoria_id' => $this->categoria_id,
            'modulo_id' => $this->modulo_id,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'foto_url' => $this->foto_path ? route('productos.foto', ['path' => $this->foto_path]) : null,
            'precio_compra' => $this->precio_compra,
            'precio_venta' => $this->precio_venta,
            'stock' => $this->stock,
            'stock_minimo' => $this->stock_minimo,
            'stock_bajo' => $this->stock <= $this->stock_minimo,
            'unidad_medida' => $this->unidad_medida,
            'estado' => $this->estado,
            'modulo' => $this->whenLoaded('modulo', fn (): array => [
                'id' => $this->modulo->id,
                'nombre' => $this->modulo->nombre,
                'estado' => $this->modulo->estado,
            ]),
            'categoria' => $this->whenLoaded('categoria', fn (): array => [
                'id' => $this->categoria->id,
                'modulo_id' => $this->categoria->modulo_id,
                'nombre' => $this->categoria->nombre,
                'estado' => $this->categoria->estado,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
