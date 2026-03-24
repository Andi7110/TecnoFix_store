<?php

namespace App\Actions\Inventario;

use App\Models\MovimientoInventario;
use App\Models\Producto;
use Illuminate\Validation\ValidationException;

class RegistrarMovimientoInventarioAction
{
    public function execute(Producto $producto, array $data): MovimientoInventario
    {
        $productoBloqueado = Producto::query()
            ->select(['id', 'stock'])
            ->lockForUpdate()
            ->findOrFail($producto->getKey());

        $stockAnterior = (int) $productoBloqueado->stock;
        $tipoMovimiento = $data['tipo_movimiento'];

        if ($tipoMovimiento === 'ajuste') {
            $stockNuevo = (int) $data['stock_nuevo'];
            $cantidad = abs($stockNuevo - $stockAnterior);

            if ($stockNuevo === $stockAnterior) {
                throw ValidationException::withMessages([
                    'stock_nuevo' => 'El ajuste debe modificar el stock actual.',
                ]);
            }
        } else {
            $cantidad = (int) $data['cantidad'];

            if ($tipoMovimiento === 'entrada') {
                $stockNuevo = $stockAnterior + $cantidad;
            } else {
                if ($cantidad > $stockAnterior) {
                    throw ValidationException::withMessages([
                        'cantidad' => 'La salida no puede dejar el stock en negativo.',
                    ]);
                }

                $stockNuevo = $stockAnterior - $cantidad;
            }
        }

        $productoBloqueado->update([
            'stock' => $stockNuevo,
        ]);

        return MovimientoInventario::query()->create([
            'producto_id' => $productoBloqueado->id,
            'tipo_movimiento' => $tipoMovimiento,
            'cantidad' => $cantidad,
            'stock_anterior' => $stockAnterior,
            'stock_nuevo' => $stockNuevo,
            'motivo' => $data['motivo'],
            'referencia' => $data['referencia'] ?? null,
            'fecha_movimiento' => $data['fecha_movimiento'],
            'observacion' => $data['observacion'] ?? null,
        ]);
    }
}
