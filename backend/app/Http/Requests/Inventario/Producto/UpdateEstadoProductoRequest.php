<?php

namespace App\Http\Requests\Inventario\Producto;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEstadoProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => ['required', 'boolean'],
        ];
    }
}
