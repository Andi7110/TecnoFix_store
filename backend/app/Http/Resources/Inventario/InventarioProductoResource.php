<?php

namespace App\Http\Resources\Inventario;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventarioProductoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'producto_id' => $this->producto_id,
            'modulo_id' => $this->modulo_id,
            'categoria_id' => $this->categoria_id,
            'registrado_por' => $this->registrado_por,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'foto_url' => $this->foto_path ? route('productos.foto', ['path' => $this->foto_path]) : null,
            'precio_compra' => $this->precio_compra,
            'precio_venta' => $this->precio_venta,
            'stock' => $this->whenLoaded('producto', fn (): int => (int) $this->producto->stock),
            'stock_inicial' => $this->stock_inicial,
            'stock_minimo' => $this->stock_minimo,
            'unidad_medida' => $this->unidad_medida,
            'estado' => $this->estado,
            'fecha_registro' => $this->fecha_registro,
            'modulo' => $this->whenLoaded('modulo', fn (): array => [
                'id' => $this->modulo->id,
                'nombre' => $this->modulo->nombre,
            ]),
            'categoria' => $this->whenLoaded('categoria', fn (): array => [
                'id' => $this->categoria->id,
                'nombre' => $this->categoria->nombre,
            ]),
            'registrado_por_usuario' => $this->whenLoaded('registradoPor', fn (): ?array => $this->registradoPor ? [
                'id' => $this->registradoPor->id,
                'name' => $this->registradoPor->name,
                'username' => $this->registradoPor->username,
                'email' => $this->registradoPor->email,
            ] : null),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
