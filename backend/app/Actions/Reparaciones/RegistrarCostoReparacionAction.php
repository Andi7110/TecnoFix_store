<?php

namespace App\Actions\Reparaciones;

use App\Models\CostoReparacion;
use App\Models\MovimientoCaja;
use App\Models\Reparacion;

class RegistrarCostoReparacionAction
{
    public function execute(Reparacion $reparacion, array $data): CostoReparacion
    {
        $monto = round((float) $data['monto'], 2);
        $fechaCosto = $data['fecha_costo'] ?? now();
        $referencia = $data['referencia'] ?? $reparacion->codigo_reparacion;

        $movimientoCaja = MovimientoCaja::query()->create([
            'modulo_id' => $reparacion->modulo_id,
            'tipo_movimiento' => 'salida',
            'categoria_movimiento' => 'reparacion',
            'concepto' => 'Costo reparacion '.$reparacion->codigo_reparacion.' - '.$data['descripcion'],
            'monto' => $monto,
            'fecha_movimiento' => $fechaCosto,
            'referencia' => $referencia,
            'observacion' => trim(implode(' ', array_filter([
                'Tipo: '.$data['tipo_costo'].'.',
                ! empty($data['proveedor']) ? 'Proveedor: '.$data['proveedor'].'.' : null,
                $data['observacion'] ?? null,
            ]))),
        ]);

        return CostoReparacion::query()->create([
            'reparacion_id' => $reparacion->id,
            'movimiento_caja_id' => $movimientoCaja->id,
            'tipo_costo' => $data['tipo_costo'],
            'descripcion' => $data['descripcion'],
            'monto' => $monto,
            'fecha_costo' => $fechaCosto,
            'proveedor' => $data['proveedor'] ?? null,
            'referencia' => $referencia,
            'observacion' => $data['observacion'] ?? null,
        ]);
    }

    public function update(CostoReparacion $costo, array $data): CostoReparacion
    {
        $monto = round((float) $data['monto'], 2);
        $fechaCosto = $data['fecha_costo'] ?? $costo->fecha_costo ?? now();
        $referencia = $data['referencia'] ?? $costo->referencia ?? $costo->reparacion->codigo_reparacion;

        $costo->update([
            'tipo_costo' => $data['tipo_costo'],
            'descripcion' => $data['descripcion'],
            'monto' => $monto,
            'fecha_costo' => $fechaCosto,
            'proveedor' => $data['proveedor'] ?? null,
            'referencia' => $referencia,
            'observacion' => $data['observacion'] ?? null,
        ]);

        if ($costo->movimiento_caja_id) {
            MovimientoCaja::query()
                ->whereKey($costo->movimiento_caja_id)
                ->update([
                    'tipo_movimiento' => 'salida',
                    'categoria_movimiento' => 'reparacion',
                    'concepto' => 'Costo reparacion '.$costo->reparacion->codigo_reparacion.' - '.$data['descripcion'],
                    'monto' => $monto,
                    'fecha_movimiento' => $fechaCosto,
                    'referencia' => $referencia,
                    'observacion' => trim(implode(' ', array_filter([
                        'Tipo: '.$data['tipo_costo'].'.',
                        ! empty($data['proveedor']) ? 'Proveedor: '.$data['proveedor'].'.' : null,
                        $data['observacion'] ?? null,
                    ]))),
                ]);
        }

        return $costo->refresh();
    }
}
