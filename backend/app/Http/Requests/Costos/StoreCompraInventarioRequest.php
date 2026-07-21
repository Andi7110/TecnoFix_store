<?php

namespace App\Http\Requests\Costos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompraInventarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_compra' => ['required', Rule::in(['accesorios', 'libreria', 'otro'])],
            'monto' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'fecha_compra' => ['required', 'date'],
            'registrar_en_caja' => ['nullable', 'boolean'],
            'observacion' => ['nullable', 'string', 'max:2000'],
            'comprobantes' => ['nullable', 'array', 'max:5'],
            'comprobantes.*' => ['file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'tipo_comprobante' => ['nullable', Rule::in(['factura', 'ticket', 'recibo', 'otro'])],
            'proveedor_comprobante' => ['nullable', 'string', 'max:255'],
            'fecha_documento' => ['nullable', 'date'],
        ];
    }
}
