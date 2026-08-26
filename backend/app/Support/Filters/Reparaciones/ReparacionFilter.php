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
            'q',
            'modulo_id',
            'estado',
            'cliente',
            'telefono',
            'marca',
            'modelo',
            'saldo',
            'fecha_desde',
            'fecha_hasta',
        ];
    }

    public function q(Builder $query, string $value): void
    {
        $search = trim($value);

        if ($search === '') {
            return;
        }

        $terms = array_slice(preg_split('/\s+/', $search) ?: [], 0, 6);

        foreach ($terms as $term) {
            $booleanTerm = $this->toBooleanFullTextTerm($term);

            $query->where(function (Builder $builder) use ($term, $booleanTerm): void {
                if ($booleanTerm !== null) {
                    $builder
                        ->whereFullText(
                            ['codigo_reparacion', 'marca', 'modelo'],
                            $booleanTerm,
                            ['mode' => 'boolean'],
                        )
                        ->orWhereHas('cliente', fn (Builder $clienteQuery) => $clienteQuery->whereFullText(
                            ['nombre', 'telefono'],
                            $booleanTerm,
                            ['mode' => 'boolean'],
                        ));

                    return;
                }

                $builder
                    ->where('codigo_reparacion', 'like', '%'.$term.'%')
                    ->orWhere('marca', 'like', '%'.$term.'%')
                    ->orWhere('modelo', 'like', '%'.$term.'%')
                    ->orWhereHas('cliente', function (Builder $clienteQuery) use ($term): void {
                        $clienteQuery
                            ->where('nombre', 'like', '%'.$term.'%')
                            ->orWhere('telefono', 'like', '%'.$term.'%');
                    });
            });
        }
    }

    private function toBooleanFullTextTerm(string $term): ?string
    {
        $tokens = array_values(array_filter(
            preg_split('/[^\pL\pN]+/u', $term) ?: [],
            fn (string $token): bool => mb_strlen($token) >= 3,
        ));

        if ($tokens === []) {
            return null;
        }

        return implode(' ', array_map(
            fn (string $token): string => '+'.$token.'*',
            $tokens,
        ));
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

    public function saldo(Builder $query, string $value): void
    {
        if ($value === 'pendiente') {
            $query->where('saldo_pendiente', '>', 0);
        }

        if ($value === 'sin_pendiente') {
            $query->where('saldo_pendiente', '<=', 0);
        }
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
