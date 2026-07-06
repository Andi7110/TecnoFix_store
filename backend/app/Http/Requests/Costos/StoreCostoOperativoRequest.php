<?php

namespace App\Http\Requests\Costos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCostoOperativoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'concepto' => ['required', 'string', 'max:255'],
            'categoria' => ['required', Rule::in([
                'transporte',
                'alquiler',
                'nomina',
                'servicios',
                'mercaderia',
                'empaque',
                'comisiones',
                'mantenimiento',
                'otro',
            ])],
            'tipo_costo' => ['required', Rule::in(['operativo', 'producto', 'compra', 'nomina'])],
            'frecuencia' => ['required', Rule::in(['unico', 'diario', 'semanal', 'mensual'])],
            'monto' => ['required', 'numeric', 'min:0.01'],
            'fecha_costo' => ['required', 'date'],
            'cantidad_distribucion' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'registrar_en_caja' => ['nullable', 'boolean'],
            'observacion' => ['nullable', 'string'],
        ];
    }
}
