<?php

namespace App\Http\Requests\Costos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexCostoOperativoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_desde' => ['nullable', 'date'],
            'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
            'categoria' => ['nullable', 'string', 'max:60'],
            'tipo_costo' => ['nullable', Rule::in(['operativo', 'producto', 'compra', 'nomina'])],
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
