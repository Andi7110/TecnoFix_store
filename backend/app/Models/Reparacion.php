<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reparacion extends Model
{
    use HasFactory;

    protected $table = 'reparaciones';

    protected $fillable = [
        'cliente_id',
        'modulo_id',
        'codigo_reparacion',
        'marca',
        'modelo',
        'tipo_equipo',
        'problema_reportado',
        'diagnostico',
        'costo_reparacion',
        'anticipo',
        'saldo_pendiente',
        'fecha_ingreso',
        'fecha_estimada_entrega',
        'fecha_entrega',
        'estado_reparacion',
        'observacion',
    ];

    protected $casts = [
        'costo_reparacion' => 'decimal:2',
        'anticipo' => 'decimal:2',
        'saldo_pendiente' => 'decimal:2',
        'fecha_ingreso' => 'datetime',
        'fecha_estimada_entrega' => 'date',
        'fecha_entrega' => 'datetime',
    ];

    public function scopePorModulo(Builder $query, int|string|null $moduloId): Builder
    {
        if (blank($moduloId)) {
            return $query;
        }

        return $query->where('modulo_id', $moduloId);
    }

    public function scopePorEstado(Builder $query, ?string $estado): Builder
    {
        if (blank($estado)) {
            return $query;
        }

        return $query->where('estado_reparacion', $estado);
    }

    public function scopeBuscarMarca(Builder $query, ?string $marca): Builder
    {
        if (blank($marca)) {
            return $query;
        }

        return $query->where('marca', 'like', '%'.$marca.'%');
    }

    public function scopeBuscarModelo(Builder $query, ?string $modelo): Builder
    {
        if (blank($modelo)) {
            return $query;
        }

        return $query->where('modelo', 'like', '%'.$modelo.'%');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }

    public function historiales(): HasMany
    {
        return $this->hasMany(HistorialReparacion::class);
    }
}
