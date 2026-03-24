<?php

namespace App\Actions\Reparaciones;

use App\Models\Cliente;

class UpsertClienteAction
{
    public function execute(array $data, ?Cliente $cliente = null): Cliente
    {
        $payload = [
            'nombre' => data_get($data, 'nombre'),
            'telefono' => data_get($data, 'telefono'),
            'direccion' => data_get($data, 'direccion'),
            'email' => data_get($data, 'email'),
            'documento' => data_get($data, 'documento'),
            'estado' => true,
        ];

        if ($cliente) {
            $cliente->update(array_filter($payload, fn ($value) => $value !== null && $value !== ''));

            return $cliente->refresh();
        }

        return Cliente::query()->create($payload);
    }
}
