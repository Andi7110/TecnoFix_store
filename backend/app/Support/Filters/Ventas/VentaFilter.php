<?php

namespace App\Support\Filters\Ventas;

use App\Support\Filters\QueryFilter;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class VentaFilter extends QueryFilter
{
    protected function filters(): array
    {
        return [
            'modulo_id',
            'numero_venta',
            'metodo_pago',
            'fecha_desde',
            'fecha_hasta',
        ];
    }

    public function modulo_id(Builder $query, int|string $value): void
    {
        $query->porModulo($value);
    }

    public function numero_venta(Builder $query, string $value): void
    {
        $query->buscarNumero($value);
    }

    public function metodo_pago(Builder $query, string $value): void
    {
        $query->porMetodoPago($value);
    }

    public function fecha_desde(Builder $query, string $value): void
    {
        $query->where('fecha_venta', '>=', Carbon::parse($value)->startOfDay());
    }

    public function fecha_hasta(Builder $query, string $value): void
    {
        $query->where('fecha_venta', '<=', Carbon::parse($value)->endOfDay());
    }
}
