<?php

namespace App\Http\Requests\CuentasPorCobrar;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAbonoCuentaPorCobrarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'monto' => ['required', 'numeric', 'min:0.01'],
            'fecha_abono' => ['required', 'date'],
            'metodo_pago' => ['required', Rule::in(['efectivo', 'transferencia', 'mixto'])],
            'referencia' => ['nullable', 'string', 'max:100'],
            'observacion' => ['nullable', 'string'],
        ];
    }
}
