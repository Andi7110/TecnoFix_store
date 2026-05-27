<?php

namespace App\Actions\Reparaciones;

use App\Models\HistorialReparacion;
use App\Models\MovimientoCaja;
use App\Models\Reparacion;
use Illuminate\Validation\ValidationException;

class RegistrarAbonoReparacionAction
{
    public function execute(Reparacion $reparacion, array $data): Reparacion
    {
        $saldoPendiente = round((float) $reparacion->saldo_pendiente, 2);

        if ($saldoPendiente <= 0) {
            throw ValidationException::withMessages([
                'saldo_pendiente' => ['La reparacion no tiene saldo pendiente.'],
            ]);
        }

        $metodoPago = $data['metodo_pago'];
        $montoEfectivo = round((float) ($data['monto_efectivo'] ?? 0), 2);
        $montoTransferencia = round((float) ($data['monto_transferencia'] ?? 0), 2);
        $montoRecibido = match ($metodoPago) {
            'efectivo' => $montoEfectivo,
            'transferencia' => $montoTransferencia,
            default => round($montoEfectivo + $montoTransferencia, 2),
        };

        if ($montoRecibido <= 0) {
            throw ValidationException::withMessages([
                'monto_recibido' => ['Ingresa el monto recibido para registrar el abono.'],
            ]);
        }

        $montoAplicado = min($montoRecibido, $saldoPendiente);
        $cambio = round(max(0, $montoRecibido - $saldoPendiente), 2);
        $saldoRestante = round(max(0, $saldoPendiente - $montoAplicado), 2);
        $observacionCaja = trim(implode(' ', array_filter([
            $data['comentario'] ?? null,
            'Metodo: '.$metodoPago.'.',
            $montoEfectivo > 0 ? 'Efectivo: $'.number_format($montoEfectivo, 2, '.', '') : null,
            $montoTransferencia > 0 ? 'Transferencia: $'.number_format($montoTransferencia, 2, '.', '') : null,
            ! empty($data['referencia_transferencia']) ? 'Ref. transferencia: '.$data['referencia_transferencia'].'.' : null,
            'Recibido: $'.number_format($montoRecibido, 2, '.', ''),
            'Aplicado: $'.number_format($montoAplicado, 2, '.', ''),
            'Restante: $'.number_format($saldoRestante, 2, '.', ''),
            'Cambio: $'.number_format($cambio, 2, '.', ''),
        ])));

        MovimientoCaja::query()->create([
            'modulo_id' => $reparacion->modulo_id,
            'tipo_movimiento' => 'entrada',
            'categoria_movimiento' => 'reparacion',
            'concepto' => 'Abono reparacion '.$reparacion->codigo_reparacion,
            'monto' => $montoAplicado,
            'fecha_movimiento' => $data['fecha_movimiento'] ?? now(),
            'referencia' => $reparacion->codigo_reparacion,
            'observacion' => $observacionCaja,
        ]);

        $reparacion->update([
            'anticipo' => round((float) $reparacion->anticipo + $montoAplicado, 2),
            'saldo_pendiente' => $saldoRestante,
        ]);

        HistorialReparacion::query()->create([
            'reparacion_id' => $reparacion->id,
            'estado_anterior' => $reparacion->estado_reparacion,
            'estado_nuevo' => $reparacion->estado_reparacion,
            'comentario' => $data['comentario'] ?? 'Abono registrado. Saldo restante: $'.number_format($saldoRestante, 2, '.', ''),
            'fecha_cambio' => now(),
        ]);

        return $reparacion->refresh();
    }
}
