<?php

namespace App\Http\Requests\Reparaciones;

use Illuminate\Foundation\Http\FormRequest;

class DailyRepairReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha' => ['nullable', 'date'],
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
        ];
    }
}
