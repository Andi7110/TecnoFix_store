<?php

namespace App\Actions\Inventario;

use App\Models\InventarioProducto;
use App\Models\Producto;

class RegistrarInventarioProductoAction
{
    public function execute(Producto $producto, int $stockInicial = 0, ?int $registradoPor = null): InventarioProducto
    {
        return InventarioProducto::query()->create([
            'producto_id' => $producto->id,
            'modulo_id' => $producto->modulo_id,
            'categoria_id' => $producto->categoria_id,
            'registrado_por' => $registradoPor,
            'codigo' => $producto->codigo,
            'nombre' => $producto->nombre,
            'descripcion' => $producto->descripcion,
            'foto_path' => $producto->foto_path,
            'precio_compra' => $producto->precio_compra,
            'precio_venta' => $producto->precio_venta,
            'stock_inicial' => max(0, $stockInicial),
            'stock_minimo' => $producto->stock_minimo,
            'unidad_medida' => $producto->unidad_medida,
            'estado' => $producto->estado,
            'fecha_registro' => $producto->created_at ?? now(),
        ]);
    }
}
