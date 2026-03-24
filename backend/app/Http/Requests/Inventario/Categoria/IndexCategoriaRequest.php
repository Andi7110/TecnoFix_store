<?php

namespace App\Http\Requests\Inventario\Categoria;

use Illuminate\Foundation\Http\FormRequest;

class IndexCategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'nombre' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
