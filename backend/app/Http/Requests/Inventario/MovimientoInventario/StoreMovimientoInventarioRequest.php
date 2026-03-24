<?php

namespace App\Http\Requests\Inventario\MovimientoInventario;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMovimientoInventarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'producto_id' => ['required', 'integer', 'exists:productos,id'],
            'tipo_movimiento' => ['required', Rule::in(['entrada', 'salida', 'ajuste'])],
            'cantidad' => ['nullable', 'integer', 'min:1', 'required_unless:tipo_movimiento,ajuste'],
            'stock_nuevo' => ['nullable', 'integer', 'min:0', 'required_if:tipo_movimiento,ajuste'],
            'motivo' => ['required', Rule::in(['compra', 'venta', 'correccion', 'perdida', 'producto_danado', 'ingreso_manual'])],
            'referencia' => ['nullable', 'string', 'max:100'],
            'fecha_movimiento' => ['required', 'date'],
            'observacion' => ['nullable', 'string'],
        ];
    }
}
