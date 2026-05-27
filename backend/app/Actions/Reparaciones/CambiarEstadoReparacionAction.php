<?php

namespace App\Actions\Reparaciones;

use App\Models\HistorialReparacion;
use App\Models\Reparacion;
use Illuminate\Validation\ValidationException;

class CambiarEstadoReparacionAction
{
    private const ALLOWED_TRANSITIONS = [
        'registrado' => ['registrado', 'en_proceso', 'terminado'],
        'en_proceso' => ['en_proceso', 'terminado', 'entregado'],
        'terminado' => ['terminado', 'entregado'],
        'entregado' => ['entregado'],
        'cancelado' => ['cancelado'],
    ];

    public function execute(
        Reparacion $reparacion,
        string $estadoNuevo,
        ?string $comentario = null,
        mixed $fechaEntrega = null,
    ): Reparacion {
        $estadoAnterior = $reparacion->estado_reparacion;

        if (! in_array($estadoNuevo, self::ALLOWED_TRANSITIONS[$estadoAnterior] ?? [], true)) {
            throw ValidationException::withMessages([
                'estado_reparacion' => ['No se puede cambiar de '.$estadoAnterior.' a '.$estadoNuevo.'.'],
            ]);
        }

        $payload = [
            'estado_reparacion' => $estadoNuevo,
        ];

        if ($estadoNuevo === 'entregado') {
            $payload['fecha_entrega'] = $fechaEntrega ?? now();
        }

        if ($estadoNuevo !== 'entregado' && $fechaEntrega !== null) {
            $payload['fecha_entrega'] = $fechaEntrega;
        }

        $reparacion->update($payload);

        HistorialReparacion::query()->create([
            'reparacion_id' => $reparacion->id,
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo' => $estadoNuevo,
            'comentario' => $comentario,
            'fecha_cambio' => now(),
        ]);

        return $reparacion->refresh();
    }

    public function initialize(Reparacion $reparacion, ?string $comentario = null): void
    {
        HistorialReparacion::query()->create([
            'reparacion_id' => $reparacion->id,
            'estado_anterior' => null,
            'estado_nuevo' => $reparacion->estado_reparacion,
            'comentario' => $comentario,
            'fecha_cambio' => now(),
        ]);
    }
}
