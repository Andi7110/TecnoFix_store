<?php

namespace App\Support\Filters\Inventario;

use App\Support\Filters\QueryFilter;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class InventarioProductoFilter extends QueryFilter
{
    protected function filters(): array
    {
        return [
            'seccion',
            'modulo_id',
            'categoria_id',
            'estado',
            'codigo',
            'nombre',
            'agotado',
            'stock_critico',
            'fecha_desde',
            'fecha_hasta',
        ];
    }

    public function seccion(Builder $query, string $value): void
    {
        $normalized = mb_strtolower(trim($value));

        if ($normalized === 'libreria') {
            $query->whereHas('modulo', fn (Builder $builder) => $builder->whereRaw('LOWER(nombre) like ?', ['%libreria%']));

            return;
        }

        if ($normalized === 'accesorios') {
            $query->whereHas('modulo', fn (Builder $builder) => $builder->whereRaw('LOWER(nombre) not like ?', ['%libreria%']));
        }
    }

    public function modulo_id(Builder $query, int|string $value): void
    {
        $query->where('modulo_id', $value);
    }

    public function categoria_id(Builder $query, int|string $value): void
    {
        $query->where('categoria_id', $value);
    }

    public function estado(Builder $query, int|bool|string $value): void
    {
        $query->where('estado', (bool) $value);
    }

    public function codigo(Builder $query, string $value): void
    {
        $query->whereHas('producto', fn (Builder $builder) => $builder->where('codigo', 'like', '%'.$value.'%'));
    }

    public function nombre(Builder $query, string $value): void
    {
        $query->whereHas('producto', fn (Builder $builder) => $builder->where('nombre', 'like', '%'.$value.'%'));
    }

    public function agotado(Builder $query, mixed $value): void
    {
        if ($this->toBoolean($value) !== true) {
            return;
        }

        $query->whereHas('producto', fn (Builder $builder) => $builder->where('stock', '<=', 0));
    }

    public function stock_critico(Builder $query, mixed $value): void
    {
        if ($this->toBoolean($value) !== true) {
            return;
        }

        $query->whereHas('producto', fn (Builder $builder) => $builder->where('stock', '=', 2));
    }

    public function fecha_desde(Builder $query, string $value): void
    {
        $query->where('fecha_registro', '>=', Carbon::parse($value)->startOfDay());
    }

    public function fecha_hasta(Builder $query, string $value): void
    {
        $query->where('fecha_registro', '<=', Carbon::parse($value)->endOfDay());
    }
}
