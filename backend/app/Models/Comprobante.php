<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comprobante extends Model
{
    use HasFactory;

    protected $fillable = [
        'costo_operativo_id',
        'movimiento_caja_id',
        'subido_por',
        'tipo_documento',
        'proveedor',
        'fecha_documento',
        'periodo_desde',
        'periodo_hasta',
        'dias_cobrados',
        'tarifa_diaria',
        'nombre_original',
        'ruta',
        'mime_type',
        'tamano',
    ];

    protected $casts = [
        'fecha_documento' => 'date',
        'periodo_desde' => 'date',
        'periodo_hasta' => 'date',
        'tarifa_diaria' => 'decimal:2',
    ];

    public function costoOperativo(): BelongsTo
    {
        return $this->belongsTo(CostoOperativo::class);
    }

    public function movimientoCaja(): BelongsTo
    {
        return $this->belongsTo(MovimientoCaja::class);
    }

    public function subidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subido_por');
    }
}
