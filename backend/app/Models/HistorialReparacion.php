<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistorialReparacion extends Model
{
    use HasFactory;

    protected $table = 'historial_reparaciones';

    protected $fillable = [
        'reparacion_id',
        'estado_anterior',
        'estado_nuevo',
        'comentario',
        'fecha_cambio',
    ];

    protected $casts = [
        'fecha_cambio' => 'datetime',
    ];

    public function reparacion(): BelongsTo
    {
        return $this->belongsTo(Reparacion::class);
    }
}
