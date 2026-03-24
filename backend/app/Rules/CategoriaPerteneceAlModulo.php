<?php

namespace App\Rules;

use App\Models\Categoria;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CategoriaPerteneceAlModulo implements ValidationRule
{
    public function __construct(
        private readonly int|string|null $moduloId,
    ) {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $this->moduloId) {
            return;
        }

        $exists = Categoria::query()
            ->whereKey($value)
            ->where('modulo_id', $this->moduloId)
            ->exists();

        if (! $exists) {
            $fail('La categoria seleccionada no pertenece al modulo indicado.');
        }
    }
}
