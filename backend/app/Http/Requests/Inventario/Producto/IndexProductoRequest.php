<?php

namespace App\Http\Requests\Inventario\Producto;

use Illuminate\Foundation\Http\FormRequest;

class IndexProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'modulo_id' => ['nullable', 'integer', 'exists:modulos,id'],
            'categoria_id' => ['nullable', 'integer', 'exists:categorias,id'],
            'estado' => ['nullable', 'boolean'],
            'nombre' => ['nullable', 'string', 'max:150'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'con_stock' => ['nullable', 'boolean'],
            'agotado' => ['nullable', 'boolean'],
            'stock_critico' => ['nullable', 'boolean'],
            'stock_bajo' => ['nullable', 'boolean'],
            'precio_min' => ['nullable', 'numeric', 'min:0'],
            'precio_max' => ['nullable', 'numeric', 'min:0', 'gte:precio_min'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
