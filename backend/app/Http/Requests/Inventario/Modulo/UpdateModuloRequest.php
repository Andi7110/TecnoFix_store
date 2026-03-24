<?php

namespace App\Http\Requests\Inventario\Modulo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateModuloRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $moduloId = $this->route('modulo')?->getKey();

        return [
            'nombre' => ['sometimes', 'string', 'max:100', Rule::unique('modulos', 'nombre')->ignore($moduloId)],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'estado' => ['sometimes', 'boolean'],
        ];
    }
}
