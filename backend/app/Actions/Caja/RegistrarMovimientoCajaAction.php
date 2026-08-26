<?php

namespace App\Actions\Caja;

use App\Models\MovimientoCaja;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegistrarMovimientoCajaAction
{
    public function execute(array $data): MovimientoCaja
    {
        return DB::transaction(function () use ($data): MovimientoCaja {
            if (($data['categoria_movimiento'] ?? null) === 'saldo_inicial') {
                $alreadyRegistered = MovimientoCaja::query()
                    ->where('categoria_movimiento', 'saldo_inicial')
                    ->lockForUpdate()
                    ->exists();

                if ($alreadyRegistered) {
                    throw ValidationException::withMessages([
                        'categoria_movimiento' => 'El saldo inicial de Caja ya fue registrado.',
                    ]);
                }
            }

            return MovimientoCaja::query()->create($data);
        });
    }
}
