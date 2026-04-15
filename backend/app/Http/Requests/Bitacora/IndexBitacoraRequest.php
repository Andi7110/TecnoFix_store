<?php

namespace App\Http\Requests\Bitacora;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexBitacoraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'buscar' => ['nullable', 'string', 'max:120'],
            'modulo' => ['nullable', 'string', 'max:80'],
            'accion' => ['nullable', Rule::in(['crear', 'actualizar', 'eliminar', 'otro'])],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'fecha_desde' => ['nullable', 'date'],
            'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
