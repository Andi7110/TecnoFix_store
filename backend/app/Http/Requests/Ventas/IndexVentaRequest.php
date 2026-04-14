<?php

namespace App\Http\Requests\Ventas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexVentaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'numero_venta' => ['nullable', 'string', 'max:50'],
            'metodo_pago' => ['nullable', Rule::in(['efectivo', 'transferencia', 'mixto'])],
            'fecha_desde' => ['nullable', 'date'],
            'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
