<?php

namespace App\Actions\Ventas;

use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CalcularTotalesVentaAction
{
    public function execute(array $data, Collection $productos): array
    {
        $productosPorId = $productos->keyBy('id');
        $detalleCalculado = [];
        $subtotalVenta = 0.0;

        foreach ($data['items'] as $item) {
            $producto = data_get($item, 'producto_id')
                ? $productosPorId->get((int) $item['producto_id'])
                : null;

            $cantidad = (int) $item['cantidad'];
            $precioUnitario = round((float) $item['precio_unitario'], 2);
            $costoUnitario = $producto
                ? round((float) $producto->precio_compra, 2)
                : round((float) ($item['costo_unitario'] ?? 0), 2);
            $subtotalItem = round($cantidad * $precioUnitario, 2);
            $gananciaItem = round($subtotalItem - ($cantidad * $costoUnitario), 2);

            $detalleCalculado[] = [
                'producto' => $producto,
                'producto_id' => $producto?->getKey(),
                'descripcion_item' => trim((string) ($item['descripcion_item'] ?? $producto?->nombre ?? '')),
                'cantidad' => $cantidad,
                'precio_unitario' => $precioUnitario,
                'costo_unitario' => $costoUnitario,
                'subtotal' => $subtotalItem,
                'ganancia_item' => $gananciaItem,
            ];

            $subtotalVenta += $subtotalItem;
        }

        $subtotalVenta = round($subtotalVenta, 2);
        $descuento = round((float) ($data['descuento'] ?? 0), 2);

        if ($descuento > $subtotalVenta) {
            throw ValidationException::withMessages([
                'descuento' => 'El descuento no puede ser mayor que el subtotal.',
            ]);
        }

        return [
            'subtotal' => $subtotalVenta,
            'descuento' => $descuento,
            'total' => round($subtotalVenta - $descuento, 2),
            'items' => $detalleCalculado,
        ];
    }
}
