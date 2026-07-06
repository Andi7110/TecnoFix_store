<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CostoOperativo extends Model
{
    use HasFactory;

    protected $table = 'costos_operativos';

    protected $fillable = [
        'modulo_id',
        'producto_id',
        'movimiento_caja_id',
        'registrado_por',
        'concepto',
        'categoria',
        'tipo_costo',
        'frecuencia',
        'monto',
        'fecha_costo',
        'cantidad_distribucion',
        'costo_unitario_estimado',
        'registrar_en_caja',
        'observacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_costo' => 'date',
        'costo_unitario_estimado' => 'decimal:2',
        'registrar_en_caja' => 'boolean',
    ];

    public function scopePorFecha(Builder $query, ?string $desde, ?string $hasta): Builder
    {
        return $query
            ->when(filled($desde), fn (Builder $query): Builder => $query->whereDate('fecha_costo', '>=', $desde))
            ->when(filled($hasta), fn (Builder $query): Builder => $query->whereDate('fecha_costo', '<=', $hasta));
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function movimientoCaja(): BelongsTo
    {
        return $this->belongsTo(MovimientoCaja::class);
    }

    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }
}
