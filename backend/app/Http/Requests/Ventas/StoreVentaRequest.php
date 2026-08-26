<?php

namespace App\Http\Requests\Ventas;

use App\Models\Producto;
use App\Models\ProductoVariante;
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
            'monto_pagado' => ['nullable', 'numeric', 'min:0'],
            'observacion' => ['nullable', 'string'],
            'cuenta_por_cobrar' => ['nullable', 'array'],
            'cuenta_por_cobrar.cliente_nombre' => ['required_with:cuenta_por_cobrar', 'string', 'max:150'],
            'cuenta_por_cobrar.cliente_telefono' => ['nullable', 'string', 'max:30'],
            'cuenta_por_cobrar.motivo' => ['required_with:cuenta_por_cobrar', 'string'],
            'cuenta_por_cobrar.fecha_promesa_pago' => ['nullable', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'items.*.descripcion_item' => ['nullable', 'string', 'max:255'],
            'items.*.cantidad' => ['required', 'integer', 'min:1'],
            'items.*.precio_unitario' => ['required', 'numeric', 'min:0'],
            'items.*.costo_unitario' => ['nullable', 'numeric', 'min:0'],
            'items.*.variante_ids' => ['nullable', 'array'],
            'items.*.variante_ids.*' => ['integer', 'distinct', 'exists:producto_variantes,id'],
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
                    ->withCount('variantes')
                    ->whereIn('id', $productoIds)
                    ->get()
                    ->keyBy('id');
                $varianteIds = collect($items)
                    ->flatMap(fn (array $item): array => data_get($item, 'variante_ids', []))
                    ->filter()
                    ->unique()
                    ->values();
                $variantes = ProductoVariante::query()
                    ->whereIn('id', $varianteIds)
                    ->get(['id', 'producto_id', 'disponible'])
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

                    $itemVarianteIds = collect(data_get($item, 'variante_ids', []))
                        ->map(fn (mixed $id): int => (int) $id)
                        ->unique()
                        ->values();

                    if ((int) $producto->variantes_count > 0 && $itemVarianteIds->count() !== (int) data_get($item, 'cantidad', 0)) {
                        $validator->errors()->add(
                            "items.{$index}.variante_ids",
                            'Selecciona el diseño exacto de cada unidad que vas a vender.'
                        );
                    }

                    foreach ($itemVarianteIds as $varianteId) {
                        $variante = $variantes->get($varianteId);

                        if (! $variante || (int) $variante->producto_id !== (int) $productoId) {
                            $validator->errors()->add(
                                "items.{$index}.variante_ids",
                                'Uno de los diseños seleccionados no pertenece a este producto.'
                            );
                        } elseif (! $variante->disponible) {
                            $validator->errors()->add(
                                "items.{$index}.variante_ids",
                                'Uno de los diseños seleccionados ya fue vendido.'
                            );
                        }
                    }
                }
            },
        ];
    }
}
