<?php

namespace App\Http\Requests\CuentasPorCobrar;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexCuentaPorCobrarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => ['nullable', Rule::in(['pendiente', 'pagada', 'vencida'])],
            'cliente' => ['nullable', 'string', 'max:150'],
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'fecha_desde' => ['nullable', 'date'],
            'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
