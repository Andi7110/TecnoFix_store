<?php

namespace App\Http\Requests\Caja;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexComprobanteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_documento' => ['nullable', Rule::in(['factura', 'ticket', 'recibo', 'otro'])],
            'origen' => ['nullable', Rule::in(['costos', 'caja'])],
            'buscar' => ['nullable', 'string', 'max:150'],
            'fecha_desde' => ['nullable', 'date'],
            'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
