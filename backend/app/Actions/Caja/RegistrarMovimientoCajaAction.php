<?php

namespace App\Actions\Caja;

use App\Models\MovimientoCaja;

class RegistrarMovimientoCajaAction
{
    public function execute(array $data): MovimientoCaja
    {
        return MovimientoCaja::query()->create($data);
    }
}
