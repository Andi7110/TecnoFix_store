<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CuentaPorCobrar extends Model
{
    use HasFactory;

    protected $table = 'cuentas_por_cobrar';

    protected $fillable = [
        'venta_id',
        'cliente_id',
        'modulo_id',
        'codigo',
        'cliente_nombre',
        'cliente_telefono',
        'monto_original',
        'monto_pagado',
        'saldo_pendiente',
        'fecha_cuenta',
        'fecha_promesa_pago',
        'estado',
        'motivo',
        'observacion',
    ];

    protected $casts = [
        'monto_original' => 'decimal:2',
        'monto_pagado' => 'decimal:2',
        'saldo_pendiente' => 'decimal:2',
        'fecha_cuenta' => 'datetime',
        'fecha_promesa_pago' => 'date',
    ];

    public function scopePorEstado(Builder $query, ?string $estado): Builder
    {
        if (blank($estado)) {
            return $query;
        }

        return $query->where('estado', $estado);
    }

    public function scopeBuscarCliente(Builder $query, ?string $cliente): Builder
    {
        if (blank($cliente)) {
            return $query;
        }

        return $query->where('cliente_nombre', 'like', '%'.$cliente.'%')
            ->orWhere('cliente_telefono', 'like', '%'.$cliente.'%');
    }

    public function scopePorModulo(Builder $query, int|string|null $moduloId): Builder
    {
        if (blank($moduloId)) {
            return $query;
        }

        return $query->where('modulo_id', $moduloId);
    }

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }

    public function abonos(): HasMany
    {
        return $this->hasMany(AbonoCuentaPorCobrar::class);
    }
}
