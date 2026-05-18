<?php

namespace App\Http\Requests\Reparaciones;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCostoReparacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (blank($this->input('fecha_costo'))) {
            $this->merge([
                'fecha_costo' => now(),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'tipo_costo' => ['required', Rule::in(['pieza', 'insumo', 'servicio_externo', 'otro'])],
            'descripcion' => ['required', 'string', 'max:180'],
            'monto' => ['required', 'numeric', 'min:0.01'],
            'fecha_costo' => ['required', 'date'],
            'proveedor' => ['nullable', 'string', 'max:150'],
            'referencia' => ['nullable', 'string', 'max:100'],
            'observacion' => ['nullable', 'string'],
        ];
    }
}
