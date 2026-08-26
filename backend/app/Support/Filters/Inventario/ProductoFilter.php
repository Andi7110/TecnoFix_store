<?php

namespace App\Support\Filters\Inventario;

use App\Support\Filters\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class ProductoFilter extends QueryFilter
{
    protected function filters(): array
    {
        return [
            'q',
            'modulo_id',
            'categoria_id',
            'estado',
            'nombre',
            'codigo',
            'con_stock',
            'agotado',
            'stock_critico',
            'stock_bajo',
            'precio_min',
            'precio_max',
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
                    $builder->whereFullText(
                        ['nombre', 'codigo'],
                        $booleanTerm,
                        ['mode' => 'boolean'],
                    );

                    return;
                }

                $builder
                    ->where('nombre', 'like', '%'.$term.'%')
                    ->orWhere('codigo', 'like', '%'.$term.'%');
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

    public function categoria_id(Builder $query, int|string $value): void
    {
        $query->porCategoria($value);
    }

    public function estado(Builder $query, mixed $value): void
    {
        $estado = $this->toBoolean($value);

        if ($estado === null) {
            return;
        }

        $query->where('estado', $estado);
    }

    public function nombre(Builder $query, string $value): void
    {
        $query->buscarNombre($value);
    }

    public function codigo(Builder $query, string $value): void
    {
        $query->buscarCodigo($value);
    }

    public function con_stock(Builder $query, mixed $value): void
    {
        $conStock = $this->toBoolean($value);

        if ($conStock !== true) {
            return;
        }

        $query->where('stock', '>', 0);
    }

    public function agotado(Builder $query, mixed $value): void
    {
        $agotado = $this->toBoolean($value);

        if ($agotado !== true) {
            return;
        }

        $query->where('stock', '<=', 0);
    }

    public function stock_critico(Builder $query, mixed $value): void
    {
        $stockCritico = $this->toBoolean($value);

        if ($stockCritico !== true) {
            return;
        }

        $query->where('stock', '=', 2);
    }

    public function stock_bajo(Builder $query, mixed $value): void
    {
        $stockBajo = $this->toBoolean($value);

        if ($stockBajo !== true) {
            return;
        }

        $query->stockBajo();
    }

    public function precio_min(Builder $query, int|float|string $value): void
    {
        $query->precioVentaDesde($value);
    }

    public function precio_max(Builder $query, int|float|string $value): void
    {
        $query->precioVentaHasta($value);
    }
}
