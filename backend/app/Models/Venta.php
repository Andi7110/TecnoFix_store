<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venta extends Model
{
    use HasFactory;

    protected $table = 'ventas';

    protected $fillable = [
        'modulo_id',
        'numero_venta',
        'fecha_venta',
        'subtotal',
        'descuento',
        'total',
        'metodo_pago',
        'observacion',
    ];

    protected $casts = [
        'fecha_venta' => 'datetime',
        'subtotal' => 'decimal:2',
        'descuento' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function scopePorModulo(Builder $query, int|string|null $moduloId): Builder
    {
        if (blank($moduloId)) {
            return $query;
        }

        return $query->where('modulo_id', $moduloId);
    }

    public function scopeBuscarNumero(Builder $query, ?string $numeroVenta): Builder
    {
        if (blank($numeroVenta)) {
            return $query;
        }

        return $query->where('numero_venta', 'like', '%'.$numeroVenta.'%');
    }

    public function scopePorMetodoPago(Builder $query, ?string $metodoPago): Builder
    {
        if (blank($metodoPago)) {
            return $query;
        }

        return $query->where('metodo_pago', $metodoPago);
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }
}
