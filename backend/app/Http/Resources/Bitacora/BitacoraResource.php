<?php

namespace App\Http\Resources\Bitacora;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BitacoraResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'usuario_nombre' => $this->usuario_nombre,
            'usuario' => $this->whenLoaded('usuario', fn (): ?array => $this->usuario ? [
                'id' => $this->usuario->id,
                'name' => $this->usuario->name,
                'email' => $this->usuario->email,
            ] : null),
            'modulo' => $this->modulo,
            'accion' => $this->accion,
            'descripcion' => $this->descripcion,
            'metodo_http' => $this->metodo_http,
            'ruta' => $this->ruta,
            'codigo_respuesta' => $this->codigo_respuesta,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'payload' => $this->payload,
            'metadata' => $this->metadata,
            'fecha_movimiento' => $this->fecha_movimiento,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
