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
                'cuenta_por_cobrar',
            ])],
            'concepto' => ['required', 'string', 'max:255'],
            'monto' => ['required', 'numeric', 'min:0.01'],
            'fecha_movimiento' => ['required', 'date'],
            'referencia' => ['nullable', 'string', 'max:100'],
            'observacion' => ['nullable', 'string'],
            'comprobantes' => ['nullable', 'array', 'max:5'],
            'comprobantes.*' => ['file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'tipo_comprobante' => ['nullable', Rule::in(['factura', 'ticket', 'recibo', 'otro'])],
            'proveedor_comprobante' => ['nullable', 'string', 'max:255'],
            'fecha_documento' => ['nullable', 'date'],
            'periodo_desde' => ['nullable', 'date'],
            'periodo_hasta' => ['nullable', 'date', 'after_or_equal:periodo_desde'],
            'dias_cobrados' => ['nullable', 'integer', 'min:1', 'max:3660'],
            'tarifa_diaria' => ['nullable', 'numeric', 'min:0.01', 'max:999999.99'],
        ];
    }
}
