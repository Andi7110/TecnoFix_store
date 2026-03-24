<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoCaja extends Model
{
    use HasFactory;

    protected $table = 'movimientos_caja';

    protected $fillable = [
        'modulo_id',
        'tipo_movimiento',
        'categoria_movimiento',
        'concepto',
        'monto',
        'fecha_movimiento',
        'referencia',
        'observacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_movimiento' => 'datetime',
    ];

    public function scopePorTipo(Builder $query, ?string $tipoMovimiento): Builder
    {
        if (blank($tipoMovimiento)) {
            return $query;
        }

        return $query->where('tipo_movimiento', $tipoMovimiento);
    }

    public function scopePorCategoria(Builder $query, ?string $categoriaMovimiento): Builder
    {
        if (blank($categoriaMovimiento)) {
            return $query;
        }

        return $query->where('categoria_movimiento', $categoriaMovimiento);
    }

    public function scopePorModulo(Builder $query, int|string|null $moduloId): Builder
    {
        if (blank($moduloId)) {
            return $query;
        }

        return $query->where('modulo_id', $moduloId);
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }
}
