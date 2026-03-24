<?php

namespace App\Services\Reparaciones;

use App\Actions\Reparaciones\CambiarEstadoReparacionAction;
use App\Actions\Reparaciones\UpsertClienteAction;
use App\Models\Cliente;
use App\Models\Reparacion;
use App\Support\Filters\Reparaciones\ReparacionFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ReparacionService
{
    public function __construct(
        private readonly ReparacionFilter $filter,
        private readonly UpsertClienteAction $upsertCliente,
        private readonly CambiarEstadoReparacionAction $cambiarEstadoReparacion,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($filters);

        $query = Reparacion::query()
            ->select([
                'id',
                'cliente_id',
                'modulo_id',
                'codigo_reparacion',
                'marca',
                'modelo',
                'tipo_equipo',
                'costo_reparacion',
                'anticipo',
                'saldo_pendiente',
                'fecha_ingreso',
                'fecha_estimada_entrega',
                'fecha_entrega',
                'estado_reparacion',
                'created_at',
                'updated_at',
            ])
            ->with([
                'cliente:id,nombre,telefono,estado',
                'modulo:id,nombre,estado',
            ])
            ->withCount('historiales');

        $this->filter->apply($query, $filters);

        return $query
            ->orderByDesc('fecha_ingreso')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function update(Reparacion $reparacion, array $data): Reparacion
    {
        return DB::transaction(function () use ($reparacion, $data): Reparacion {
            $cliente = $this->resolveCliente($reparacion, $data);

            $reparacion->update([
                'cliente_id' => $cliente->id,
                'modulo_id' => $data['modulo_id'] ?? $reparacion->modulo_id,
                'marca' => $data['marca'] ?? $reparacion->marca,
                'modelo' => $data['modelo'] ?? $reparacion->modelo,
                'tipo_equipo' => $data['tipo_equipo'] ?? $reparacion->tipo_equipo,
                'problema_reportado' => $data['problema_reportado'] ?? $reparacion->problema_reportado,
                'diagnostico' => $data['diagnostico'] ?? null,
                'costo_reparacion' => $data['costo_reparacion'],
                'anticipo' => $data['anticipo'],
                'saldo_pendiente' => $data['saldo_pendiente'],
                'fecha_ingreso' => $data['fecha_ingreso'] ?? $reparacion->fecha_ingreso,
                'fecha_estimada_entrega' => $data['fecha_estimada_entrega'] ?? null,
                'fecha_entrega' => $data['fecha_entrega'] ?? $reparacion->fecha_entrega,
                'observacion' => $data['observacion'] ?? null,
            ]);

            return $this->loadRelations($reparacion->refresh());
        });
    }

    public function changeStatus(Reparacion $reparacion, array $data): Reparacion
    {
        return DB::transaction(function () use ($reparacion, $data): Reparacion {
            $updated = $this->cambiarEstadoReparacion->execute(
                $reparacion,
                $data['estado_reparacion'],
                $data['comentario'] ?? null,
                $data['fecha_entrega'] ?? null,
            );

            return $this->loadRelations($updated);
        });
    }

    public function loadRelations(Reparacion $reparacion): Reparacion
    {
        return $reparacion->load([
            'cliente',
            'modulo:id,nombre,estado',
            'historiales' => fn ($query) => $query->orderByDesc('fecha_cambio')->orderByDesc('id'),
        ])->loadCount('historiales');
    }

    private function resolveCliente(Reparacion $reparacion, array $data): Cliente
    {
        $cliente = $reparacion->cliente()->first();

        if (! empty($data['cliente_id'])) {
            $cliente = Cliente::query()->findOrFail($data['cliente_id']);
        }

        if (! empty($data['cliente'])) {
            return $this->upsertCliente->execute($data['cliente'], $cliente);
        }

        return $cliente;
    }

    private function resolvePerPage(array &$filters): int
    {
        $perPage = (int) ($filters['per_page'] ?? 15);

        unset($filters['per_page']);

        return min(max($perPage, 1), 100);
    }
}
