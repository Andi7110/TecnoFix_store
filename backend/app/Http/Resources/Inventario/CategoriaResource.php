<?php

namespace App\Http\Resources\Inventario;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoriaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'modulo_id' => $this->modulo_id,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'estado' => $this->estado,
            'productos_count' => $this->whenCounted('productos'),
            'modulo' => $this->whenLoaded('modulo', fn (): array => [
                'id' => $this->modulo->id,
                'nombre' => $this->modulo->nombre,
                'estado' => $this->modulo->estado,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
