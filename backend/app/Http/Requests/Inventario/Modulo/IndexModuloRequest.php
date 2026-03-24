<?php

namespace App\Http\Requests\Inventario\Modulo;

use Illuminate\Foundation\Http\FormRequest;

class IndexModuloRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
