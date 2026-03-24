<?php

namespace App\Http\Requests\Inventario\Producto;

use App\Rules\CategoriaPerteneceAlModulo;
use App\Support\Inventario\ProductoCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $moduloId = $this->input('modulo_id');

        return [
            'categoria_id' => ['required', 'integer', 'exists:categorias,id', new CategoriaPerteneceAlModulo($moduloId)],
            'modulo_id' => ['required', 'integer', 'exists:modulos,id'],
            'codigo' => ['required', 'string', 'max:50', 'regex:'.ProductoCode::PATTERN, Rule::unique('productos', 'codigo')],
            'nombre' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'precio_compra' => ['required', 'numeric', 'min:0'],
            'precio_venta' => ['required', 'numeric', 'min:0'],
            'stock_inicial' => ['nullable', 'integer', 'min:0'],
            'unidad_medida' => ['nullable', 'string', 'max:50'],
            'estado' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'codigo' => ProductoCode::normalize($this->input('codigo')),
            'stock_minimo' => 2,
            'unidad_medida' => $this->input('unidad_medida', 'unidad'),
        ]);
    }
}
