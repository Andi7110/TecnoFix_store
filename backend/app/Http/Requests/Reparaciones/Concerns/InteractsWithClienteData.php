<?php

namespace App\Http\Requests\Reparaciones\Concerns;

use Illuminate\Validation\Validator;

trait InteractsWithClienteData
{
    protected function validateClientePayload(Validator $validator): void
    {
        $clienteId = $this->input('cliente_id');
        $cliente = $this->input('cliente', []);
        $nombre = trim((string) data_get($cliente, 'nombre', ''));

        if (! $clienteId && $nombre === '') {
            $validator->errors()->add('cliente.nombre', 'Debes seleccionar un cliente o registrar uno nuevo.');
        }
    }

    protected function validateMontos(Validator $validator): void
    {
        $costo = (float) $this->input('costo_reparacion', 0);
        $anticipo = (float) $this->input('anticipo', 0);

        if ($anticipo > $costo) {
            $validator->errors()->add('anticipo', 'El anticipo no puede ser mayor al costo de reparacion.');
        }
    }
}
