<?php

namespace App\Http\Requests\Ventas;

use App\Models\Producto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreVentaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'modulo_id' => ['required', 'integer', 'exists:modulos,id'],
            'fecha_venta' => ['required', 'date'],
            'descuento' => ['nullable', 'numeric', 'min:0'],
            'metodo_pago' => ['required', Rule::in(['efectivo', 'transferencia', 'mixto'])],
            'observacion' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'items.*.descripcion_item' => ['nullable', 'string', 'max:255'],
            'items.*.cantidad' => ['required', 'integer', 'min:1'],
            'items.*.precio_unitario' => ['required', 'numeric', 'min:0'],
            'items.*.costo_unitario' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'descuento' => $this->input('descuento', 0),
        ]);
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $items = $this->input('items', []);
                $moduloId = (int) $this->input('modulo_id');
                $productoIds = collect($items)
                    ->pluck('producto_id')
                    ->filter()
                    ->unique()
                    ->values();

                $productos = Producto::query()
                    ->select(['id', 'modulo_id', 'estado'])
                    ->whereIn('id', $productoIds)
                    ->get()
                    ->keyBy('id');

                foreach ($items as $index => $item) {
                    $productoId = data_get($item, 'producto_id');
                    $descripcion = trim((string) data_get($item, 'descripcion_item', ''));

                    if (! $productoId && $descripcion === '') {
                        $validator->errors()->add(
                            "items.{$index}.descripcion_item",
                            'La descripcion es obligatoria cuando el item no esta vinculado a un producto.'
                        );
                    }

                    if (! $productoId) {
                        continue;
                    }

                    $producto = $productos->get($productoId);

                    if (! $producto) {
                        continue;
                    }

                    if ((int) $producto->modulo_id !== $moduloId) {
                        $validator->errors()->add(
                            "items.{$index}.producto_id",
                            'El producto debe pertenecer al mismo modulo de la venta.'
                        );
                    }

                    if (! $producto->estado) {
                        $validator->errors()->add(
                            "items.{$index}.producto_id",
                            'No se puede vender un producto inactivo.'
                        );
                    }
                }
            },
        ];
    }
}
