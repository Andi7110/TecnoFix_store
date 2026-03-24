<?php

namespace App\Http\Requests\Inventario\Categoria;

use App\Models\Categoria;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoria = $this->route('categoria');
        $moduloId = $this->input('modulo_id', $categoria?->modulo_id);

        return [
            'modulo_id' => ['sometimes', 'integer', 'exists:modulos,id'],
            'nombre' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('categorias', 'nombre')
                    ->where(fn ($query) => $query->where('modulo_id', $moduloId))
                    ->ignore($categoria?->getKey()),
            ],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'estado' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var Categoria|null $categoria */
                $categoria = $this->route('categoria');

                if (! $categoria || ! $this->hasAny(['modulo_id', 'nombre'])) {
                    return;
                }

                $moduloId = $this->input('modulo_id', $categoria->modulo_id);
                $nombre = $this->input('nombre', $categoria->nombre);

                $exists = Categoria::query()
                    ->where('modulo_id', $moduloId)
                    ->where('nombre', $nombre)
                    ->whereKeyNot($categoria->getKey())
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('nombre', 'Ya existe una categoria con ese nombre en el modulo seleccionado.');
                }
            },
        ];
    }
}
