<?php

namespace App\Support\Filters\Inventario;

use App\Support\Filters\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class ModuloFilter extends QueryFilter
{
    protected function filters(): array
    {
        return [
            'nombre',
            'estado',
        ];
    }

    public function nombre(Builder $query, string $value): void
    {
        $this->like($query, 'nombre', $value);
    }

    public function estado(Builder $query, mixed $value): void
    {
        $estado = $this->toBoolean($value);

        if ($estado === null) {
            return;
        }

        $query->where('estado', $estado);
    }
}
