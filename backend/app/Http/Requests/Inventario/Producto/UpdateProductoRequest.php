<?php

namespace App\Http\Requests\Inventario\Producto;

use App\Models\Producto;
use App\Rules\CategoriaPerteneceAlModulo;
use App\Support\Inventario\ProductoCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $producto = $this->route('producto');
        $moduloId = $this->input('modulo_id', $producto?->modulo_id);

        return [
            'categoria_id' => ['sometimes', 'integer', 'exists:categorias,id', new CategoriaPerteneceAlModulo($moduloId)],
            'modulo_id' => ['sometimes', 'integer', 'exists:modulos,id'],
            'codigo' => ['sometimes', 'string', 'max:50', 'regex:'.ProductoCode::PATTERN, Rule::unique('productos', 'codigo')->ignore($producto?->getKey())],
            'nombre' => ['sometimes', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'precio_compra' => ['sometimes', 'numeric', 'min:0'],
            'precio_venta' => ['sometimes', 'numeric', 'min:0'],
            'unidad_medida' => ['sometimes', 'string', 'max:50'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var Producto|null $producto */
                $producto = $this->route('producto');

                if (! $producto) {
                    return;
                }

                $moduloId = $this->input('modulo_id', $producto->modulo_id);
                $categoriaId = $this->input('categoria_id', $producto->categoria_id);

                $rule = new CategoriaPerteneceAlModulo($moduloId);

                $rule->validate('categoria_id', $categoriaId, function (string $message) use ($validator): void {
                    $validator->errors()->add('categoria_id', $message);
                });
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $payload = [
            'stock_minimo' => 2,
        ];

        if ($this->has('codigo')) {
            $payload['codigo'] = ProductoCode::normalize($this->input('codigo'));
        }

        $this->merge($payload);
    }
}
