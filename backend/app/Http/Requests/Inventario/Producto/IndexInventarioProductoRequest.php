<?php

namespace App\Http\Requests\Inventario\Producto;

use Illuminate\Foundation\Http\FormRequest;

class IndexInventarioProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'seccion' => ['nullable', 'string', 'in:accesorios,libreria'],
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'categoria_id' => ['nullable', 'integer', 'exists:categorias,id'],
            'estado' => ['nullable', 'boolean'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'nombre' => ['nullable', 'string', 'max:150'],
            'fecha_desde' => ['nullable', 'date'],
            'fecha_hasta' => ['nullable', 'date', 'after_or_equal:fecha_desde'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
