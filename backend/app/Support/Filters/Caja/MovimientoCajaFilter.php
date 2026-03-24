<?php

namespace App\Support\Filters\Caja;

use App\Support\Filters\QueryFilter;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class MovimientoCajaFilter extends QueryFilter
{
    protected function filters(): array
    {
        return [
            'tipo_movimiento',
            'categoria_movimiento',
            'modulo_id',
            'fecha_desde',
            'fecha_hasta',
        ];
    }

    public function tipo_movimiento(Builder $query, string $value): void
    {
        $query->porTipo($value);
    }

    public function categoria_movimiento(Builder $query, string $value): void
    {
        $query->porCategoria($value);
    }

    public function modulo_id(Builder $query, int|string $value): void
    {
        $query->porModulo($value);
    }

    public function fecha_desde(Builder $query, string $value): void
    {
        $query->where('fecha_movimiento', '>=', Carbon::parse($value)->startOfDay());
    }

    public function fecha_hasta(Builder $query, string $value): void
    {
        $query->where('fecha_movimiento', '<=', Carbon::parse($value)->endOfDay());
    }
}
