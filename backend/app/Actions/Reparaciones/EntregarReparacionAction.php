<?php

namespace App\Actions\Reparaciones;

use App\Models\MovimientoCaja;
use App\Models\Reparacion;
use Illuminate\Validation\ValidationException;

class EntregarReparacionAction
{
    public function __construct(
        private readonly CambiarEstadoReparacionAction $cambiarEstadoReparacion,
    ) {
    }

    public function execute(Reparacion $reparacion, array $data): Reparacion
    {
        if ($reparacion->estado_reparacion === 'entregado') {
            throw ValidationException::withMessages([
                'estado_reparacion' => ['La reparacion ya fue entregada.'],
            ]);
        }

        $saldoPendiente = round((float) $reparacion->saldo_pendiente, 2);
        $metodoPago = $data['metodo_pago'];
        $montoEfectivo = round((float) ($data['monto_efectivo'] ?? 0), 2);
        $montoTransferencia = round((float) ($data['monto_transferencia'] ?? 0), 2);
        $montoRecibido = match ($metodoPago) {
            'efectivo' => $montoEfectivo,
            'transferencia' => $montoTransferencia,
            default => round($montoEfectivo + $montoTransferencia, 2),
        };

        if ($montoRecibido <= 0 && $saldoPendiente > 0) {
            throw ValidationException::withMessages([
                'monto_recibido' => ['Ingresa el monto recibido para registrar la entrega.'],
            ]);
        }

        $montoCobrado = min($montoRecibido, $saldoPendiente);
        $cambio = round(max(0, $montoRecibido - $saldoPendiente), 2);
        $saldoRestante = round(max(0, $saldoPendiente - $montoCobrado), 2);
        $observacionCaja = trim(implode(' ', array_filter([
            $data['comentario'] ?? null,
            'Metodo: '.$metodoPago.'.',
            $montoEfectivo > 0 ? 'Efectivo: $'.number_format($montoEfectivo, 2, '.', '') : null,
            $montoTransferencia > 0 ? 'Transferencia: $'.number_format($montoTransferencia, 2, '.', '') : null,
            ! empty($data['referencia_transferencia']) ? 'Ref. transferencia: '.$data['referencia_transferencia'].'.' : null,
            'Recibido: $'.number_format($montoRecibido, 2, '.', ''),
            'Aplicado: $'.number_format($montoCobrado, 2, '.', ''),
            'Restante: $'.number_format($saldoRestante, 2, '.', ''),
            'Cambio: $'.number_format($cambio, 2, '.', ''),
        ])));

        if ($montoCobrado > 0) {
            MovimientoCaja::query()->create([
                'modulo_id' => $reparacion->modulo_id,
                'tipo_movimiento' => 'entrada',
                'categoria_movimiento' => 'reparacion',
                'concepto' => 'Reparacion '.$reparacion->codigo_reparacion,
                'monto' => $montoCobrado,
                'fecha_movimiento' => $data['fecha_movimiento'] ?? now(),
                'referencia' => $reparacion->codigo_reparacion,
                'observacion' => $observacionCaja,
            ]);
        }

        $reparacion->update([
            'anticipo' => round((float) $reparacion->anticipo + $montoCobrado, 2),
            'saldo_pendiente' => $saldoRestante,
        ]);

        return $this->cambiarEstadoReparacion->execute(
            $reparacion,
            'entregado',
            $data['comentario'] ?? 'Reparacion entregada y cobrada.',
            $data['fecha_movimiento'] ?? now(),
        );
    }
}
