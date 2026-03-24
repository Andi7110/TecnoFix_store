<?php

namespace App\Support\Inventario;

class ProductoCode
{
    public const PATTERN = '/^[A-Z]{3}-[A-Z]{3}-\d{3}$/';

    public static function normalize(null|string|int $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = strtoupper(trim((string) $value));
        $normalized = preg_replace('/[^A-Z0-9]+/', '-', $normalized) ?? $normalized;
        $normalized = trim($normalized, '-');

        return $normalized === '' ? null : $normalized;
    }
}
