<?php

namespace App\Support\Inventario;

use Illuminate\Support\Str;

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

    public static function prefix(string $modulo, string $categoria): string
    {
        $moduloToken = self::token($modulo);
        $categoriaToken = self::token($categoria);

        return $moduloToken.'-'.$categoriaToken;
    }

    public static function build(string $prefix, int $sequence): string
    {
        return self::normalize($prefix).'-'.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }

    private static function token(string $value): string
    {
        $ascii = strtoupper(Str::ascii($value));
        $normalized = preg_replace('/[^A-Z0-9]+/', '', $ascii) ?? '';

        return str_pad(substr($normalized, 0, 3), 3, 'X');
    }
}
