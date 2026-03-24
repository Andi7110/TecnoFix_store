<?php

namespace App\Http\Requests\Reparaciones;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEstadoReparacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado_reparacion' => ['required', Rule::in(['registrado', 'en_proceso', 'terminado', 'entregado', 'cancelado'])],
            'comentario' => ['nullable', 'string'],
            'fecha_entrega' => ['nullable', 'date'],
        ];
    }
}
