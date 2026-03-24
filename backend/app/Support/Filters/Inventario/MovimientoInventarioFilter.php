<?php

namespace App\Support\Filters\Inventario;

use App\Support\Filters\QueryFilter;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class MovimientoInventarioFilter extends QueryFilter
{
    protected function filters(): array
    {
        return [
            'producto_id',
            'modulo_id',
            'categoria_id',
            'tipo_movimiento',
            'motivo',
            'referencia',
            'fecha_desde',
            'fecha_hasta',
        ];
    }

    public function producto_id(Builder $query, int|string $value): void
    {
        $query->where('producto_id', $value);
    }

    public function modulo_id(Builder $query, int|string $value): void
    {
        $query->whereHas('producto', fn (Builder $builder) => $builder->where('modulo_id', $value));
    }

    public function categoria_id(Builder $query, int|string $value): void
    {
        $query->whereHas('producto', fn (Builder $builder) => $builder->where('categoria_id', $value));
    }

    public function tipo_movimiento(Builder $query, string $value): void
    {
        $query->where('tipo_movimiento', $value);
    }

    public function motivo(Builder $query, string $value): void
    {
        $query->where('motivo', $value);
    }

    public function referencia(Builder $query, string $value): void
    {
        $this->like($query, 'referencia', $value);
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
