<?php

namespace App\Http\Requests\Reparaciones;

use App\Http\Requests\Reparaciones\Concerns\InteractsWithClienteData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateReparacionRequest extends FormRequest
{
    use InteractsWithClienteData;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => ['nullable', 'integer', 'exists:clientes,id'],
            'cliente' => ['nullable', 'array'],
            'cliente.nombre' => ['nullable', 'string', 'max:150'],
            'cliente.telefono' => ['nullable', 'string', 'max:30'],
            'cliente.direccion' => ['nullable', 'string', 'max:255'],
            'cliente.email' => ['nullable', 'email', 'max:150'],
            'cliente.documento' => ['nullable', 'string', 'max:50'],
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'marca' => ['sometimes', 'string', 'max:100'],
            'modelo' => ['sometimes', 'string', 'max:100'],
            'tipo_equipo' => ['sometimes', Rule::in(['celular', 'tablet', 'otro'])],
            'problema_reportado' => ['sometimes', 'string'],
            'diagnostico' => ['nullable', 'string'],
            'costo_reparacion' => ['sometimes', 'numeric', 'min:0'],
            'anticipo' => ['sometimes', 'numeric', 'min:0'],
            'saldo_pendiente' => ['nullable', 'numeric', 'min:0'],
            'fecha_ingreso' => ['sometimes', 'date'],
            'fecha_estimada_entrega' => ['nullable', 'date'],
            'fecha_entrega' => ['nullable', 'date'],
            'observacion' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $reparacion = $this->route('reparacione') ?? $this->route('reparacion');
        $costo = round((float) $this->input('costo_reparacion', $reparacion?->costo_reparacion ?? 0), 2);
        $anticipo = round((float) $this->input('anticipo', $reparacion?->anticipo ?? 0), 2);

        $this->merge([
            'costo_reparacion' => $costo,
            'anticipo' => $anticipo,
            'saldo_pendiente' => round($costo - $anticipo, 2),
        ]);
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $this->validateClientePayload($validator);
                $this->validateMontos($validator);
            },
        ];
    }
}
