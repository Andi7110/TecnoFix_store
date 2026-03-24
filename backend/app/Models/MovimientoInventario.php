<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoInventario extends Model
{
    use HasFactory;

    protected $table = 'movimientos_inventario';

    protected $fillable = [
        'producto_id',
        'tipo_movimiento',
        'cantidad',
        'stock_anterior',
        'stock_nuevo',
        'motivo',
        'referencia',
        'fecha_movimiento',
        'observacion',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'stock_anterior' => 'integer',
        'stock_nuevo' => 'integer',
        'fecha_movimiento' => 'datetime',
    ];

    public function scopePorProducto(Builder $query, int|string|null $productoId): Builder
    {
        if (blank($productoId)) {
            return $query;
        }

        return $query->where('producto_id', $productoId);
    }

    public function scopePorTipo(Builder $query, ?string $tipoMovimiento): Builder
    {
        if (blank($tipoMovimiento)) {
            return $query;
        }

        return $query->where('tipo_movimiento', $tipoMovimiento);
    }

    public function scopePorMotivo(Builder $query, ?string $motivo): Builder
    {
        if (blank($motivo)) {
            return $query;
        }

        return $query->where('motivo', $motivo);
    }

    public function scopeRecientes(Builder $query): Builder
    {
        return $query->orderByDesc('fecha_movimiento')->orderByDesc('id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
