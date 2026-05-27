<?php

namespace App\Http\Requests\Reparaciones;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RepairReportHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_reporte' => ['nullable', Rule::in(['diario_reparaciones', 'mensual_reparaciones'])],
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
