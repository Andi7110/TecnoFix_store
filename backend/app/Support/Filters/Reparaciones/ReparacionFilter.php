<?php

namespace App\Support\Filters\Reparaciones;

use App\Support\Filters\QueryFilter;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class ReparacionFilter extends QueryFilter
{
    protected function filters(): array
    {
        return [
            'modulo_id',
            'estado',
            'cliente',
            'telefono',
            'marca',
            'modelo',
            'fecha_desde',
            'fecha_hasta',
        ];
    }

    public function modulo_id(Builder $query, int|string $value): void
    {
        $query->porModulo($value);
    }

    public function estado(Builder $query, string $value): void
    {
        $query->porEstado($value);
    }

    public function cliente(Builder $query, string $value): void
    {
        $query->whereHas('cliente', fn (Builder $builder) => $builder->where('nombre', 'like', '%'.$value.'%'));
    }

    public function telefono(Builder $query, string $value): void
    {
        $query->whereHas('cliente', fn (Builder $builder) => $builder->where('telefono', 'like', '%'.$value.'%'));
    }

    public function marca(Builder $query, string $value): void
    {
        $query->buscarMarca($value);
    }

    public function modelo(Builder $query, string $value): void
    {
        $query->buscarModelo($value);
    }

    public function fecha_desde(Builder $query, string $value): void
    {
        $query->where('fecha_ingreso', '>=', Carbon::parse($value)->startOfDay());
    }

    public function fecha_hasta(Builder $query, string $value): void
    {
        $query->where('fecha_ingreso', '<=', Carbon::parse($value)->endOfDay());
    }
}
