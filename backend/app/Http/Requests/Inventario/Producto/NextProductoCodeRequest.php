<?php

namespace App\Http\Requests\Inventario\Producto;

use App\Rules\CategoriaPerteneceAlModulo;
use Illuminate\Foundation\Http\FormRequest;

class NextProductoCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $moduloId = $this->input('modulo_id');

        return [
            'modulo_id' => ['required', 'integer', 'exists:modulos,id'],
            'categoria_id' => [
                'required',
                'integer',
                'exists:categorias,id',
                new CategoriaPerteneceAlModulo($moduloId),
            ],
        ];
    }
}
