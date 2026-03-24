<?php

namespace App\Http\Requests\Caja;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMovimientoCajaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'tipo_movimiento' => ['required', Rule::in(['entrada', 'salida'])],
            'categoria_movimiento' => ['required', Rule::in([
                'venta',
                'gasto',
                'costo_fijo',
                'reparacion',
                'retiro',
                'ingreso_manual',
                'ajuste_caja',
                'compra_productos',
            ])],
            'concepto' => ['required', 'string', 'max:255'],
            'monto' => ['required', 'numeric', 'min:0.01'],
            'fecha_movimiento' => ['required', 'date'],
            'referencia' => ['nullable', 'string', 'max:100'],
            'observacion' => ['nullable', 'string'],
        ];
    }
}
