<?php

namespace App\Http\Requests\Reparaciones;

use App\Http\Requests\Reparaciones\Concerns\InteractsWithClienteData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreReparacionRequest extends FormRequest
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
            'marca' => ['required', 'string', 'max:100'],
            'modelo' => ['required', 'string', 'max:100'],
            'tipo_equipo' => ['required', Rule::in(['celular', 'tablet', 'otro'])],
            'problema_reportado' => ['required', 'string'],
            'diagnostico' => ['nullable', 'string'],
            'costo_reparacion' => ['nullable', 'numeric', 'min:0'],
            'anticipo' => ['nullable', 'numeric', 'min:0'],
            'saldo_pendiente' => ['nullable', 'numeric', 'min:0'],
            'fecha_ingreso' => ['required', 'date'],
            'fecha_estimada_entrega' => ['nullable', 'date'],
            'observacion' => ['nullable', 'string'],
            'estado_reparacion' => ['nullable', Rule::in(['registrado', 'en_proceso', 'terminado', 'entregado', 'cancelado'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        $costo = round((float) $this->input('costo_reparacion', 0), 2);
        $anticipo = round((float) $this->input('anticipo', 0), 2);

        $this->merge([
            'costo_reparacion' => $costo,
            'anticipo' => $anticipo,
            'estado_reparacion' => $this->input('estado_reparacion', 'registrado'),
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
