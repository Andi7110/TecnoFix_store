<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CostoReparacion extends Model
{
    use HasFactory;

    protected $table = 'costos_reparacion';

    protected $fillable = [
        'reparacion_id',
        'movimiento_caja_id',
        'tipo_costo',
        'descripcion',
        'monto',
        'fecha_costo',
        'proveedor',
        'referencia',
        'observacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_costo' => 'datetime',
    ];

    public function reparacion(): BelongsTo
    {
        return $this->belongsTo(Reparacion::class);
    }

    public function movimientoCaja(): BelongsTo
    {
        return $this->belongsTo(MovimientoCaja::class);
    }
}
