<?php

namespace App\Actions\Inventario;

use App\Models\Producto;

class CambiarEstadoProductoAction
{
    public function execute(Producto $producto, bool $estado): Producto
    {
        $producto->forceFill([
            'estado' => $estado,
        ])->save();

        return $producto->refresh();
    }
}
