<?php

namespace App\Services\Inventario;

use App\Models\Modulo;
use App\Support\Filters\Inventario\ModuloFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ModuloService
{
    public function __construct(
        private readonly ModuloFilter $filter,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        $query = Modulo::query()
            ->select(['id', 'nombre', 'descripcion', 'estado', 'created_at', 'updated_at'])
            ->withCount(['categorias', 'productos']);

        $this->filter->apply($query, $filters);

        return $query
            ->orderBy('nombre')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Modulo
    {
        return Modulo::query()->create($data);
    }

    public function update(Modulo $modulo, array $data): Modulo
    {
        $modulo->update($data);

        return $this->loadRelations($modulo);
    }

    public function loadRelations(Modulo $modulo): Modulo
    {
        return $modulo->loadCount(['categorias', 'productos']);
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }
}
