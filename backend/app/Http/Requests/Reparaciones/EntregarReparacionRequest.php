<?php

namespace App\Http\Requests\Reparaciones;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EntregarReparacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'metodo_pago' => ['required', Rule::in(['efectivo', 'transferencia', 'mixto'])],
            'monto_recibido' => ['nullable', 'numeric', 'min:0'],
            'monto_efectivo' => ['nullable', 'numeric', 'min:0'],
            'monto_transferencia' => ['nullable', 'numeric', 'min:0'],
            'referencia_transferencia' => ['nullable', 'string', 'max:100'],
            'fecha_movimiento' => ['nullable', 'date'],
            'comentario' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('fecha_movimiento') || blank($this->input('fecha_movimiento'))) {
            $this->merge([
                'fecha_movimiento' => now(),
            ]);
        }
    }
}
