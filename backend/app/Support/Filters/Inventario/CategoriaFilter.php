<?php

namespace App\Support\Filters\Inventario;

use App\Support\Filters\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class CategoriaFilter extends QueryFilter
{
    protected function filters(): array
    {
        return [
            'modulo_id',
            'nombre',
            'estado',
        ];
    }

    public function modulo_id(Builder $query, int|string $value): void
    {
        $query->where('modulo_id', $value);
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
