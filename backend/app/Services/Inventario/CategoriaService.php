<?php

namespace App\Services\Inventario;

use App\Models\Categoria;
use App\Support\Filters\Inventario\CategoriaFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoriaService
{
    public function __construct(
        private readonly CategoriaFilter $filter,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        $query = Categoria::query()
            ->select(['id', 'modulo_id', 'nombre', 'descripcion', 'estado', 'created_at', 'updated_at'])
            ->with([
                'modulo:id,nombre,estado',
            ])
            ->withCount('productos');

        $this->filter->apply($query, $filters);

        return $query
            ->orderBy('nombre')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Categoria
    {
        $categoria = Categoria::query()->create($data);

        return $this->loadRelations($categoria);
    }

    public function update(Categoria $categoria, array $data): Categoria
    {
        $categoria->update($data);

        return $this->loadRelations($categoria);
    }

    public function loadRelations(Categoria $categoria): Categoria
    {
        return $categoria
            ->load(['modulo:id,nombre,estado'])
            ->loadCount('productos');
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }
}
