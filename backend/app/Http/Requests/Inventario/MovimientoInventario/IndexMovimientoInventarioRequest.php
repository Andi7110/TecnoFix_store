<?php

namespace App\Http\Requests\Inventario\MovimientoInventario;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexMovimientoInventarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'categoria_id' => ['nullable', 'integer', 'exists:categorias,id'],
            'tipo_movimiento' => ['nullable', Rule::in(['entrada', 'salida', 'ajuste'])],
            'motivo' => ['nullable', Rule::in(['compra', 'venta', 'correccion', 'perdida', 'producto_danado', 'ingreso_manual'])],
            'referencia' => ['nullable', 'string', 'max:100'],
            'fecha_desde' => ['nullable', 'date'],
            'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
