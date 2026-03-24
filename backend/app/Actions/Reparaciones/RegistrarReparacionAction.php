<?php

namespace App\Actions\Reparaciones;

use App\Models\Cliente;
use App\Models\Reparacion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RegistrarReparacionAction
{
    public function __construct(
        private readonly UpsertClienteAction $upsertCliente,
        private readonly CambiarEstadoReparacionAction $cambiarEstadoReparacion,
    ) {
    }

    public function execute(array $data): Reparacion
    {
        return DB::transaction(function () use ($data): Reparacion {
            $cliente = $this->resolveCliente($data);
            $codigo = $this->generateCodigoReparacion();

            $reparacion = Reparacion::query()->create([
                'cliente_id' => $cliente->id,
                'modulo_id' => $data['modulo_id'] ?? null,
                'codigo_reparacion' => $codigo,
                'marca' => $data['marca'],
                'modelo' => $data['modelo'],
                'tipo_equipo' => $data['tipo_equipo'],
                'problema_reportado' => $data['problema_reportado'],
                'diagnostico' => $data['diagnostico'] ?? null,
                'costo_reparacion' => $data['costo_reparacion'],
                'anticipo' => $data['anticipo'],
                'saldo_pendiente' => $data['saldo_pendiente'],
                'fecha_ingreso' => $data['fecha_ingreso'],
                'fecha_estimada_entrega' => $data['fecha_estimada_entrega'] ?? null,
                'estado_reparacion' => $data['estado_reparacion'],
                'observacion' => $data['observacion'] ?? null,
            ]);

            $this->cambiarEstadoReparacion->initialize($reparacion, 'Reparacion registrada.');

            return $reparacion->load([
                'cliente',
                'modulo:id,nombre,estado',
                'historiales',
            ])->loadCount('historiales');
        });
    }

    private function resolveCliente(array $data): Cliente
    {
        if (! empty($data['cliente_id'])) {
            $cliente = Cliente::query()->findOrFail($data['cliente_id']);

            if (! empty($data['cliente'])) {
                return $this->upsertCliente->execute($data['cliente'], $cliente);
            }

            return $cliente;
        }

        return $this->upsertCliente->execute($data['cliente'] ?? []);
    }

    private function generateCodigoReparacion(): string
    {
        return 'REP-'.now()->format('Ymd-His').'-'.Str::upper(Str::random(4));
    }
}
