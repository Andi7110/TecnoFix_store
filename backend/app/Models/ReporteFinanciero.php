<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReporteFinanciero extends Model
{
    use HasFactory;

    protected $table = 'reportes_financieros';

    protected $fillable = [
        'tipo_reporte',
        'titulo',
        'modulo_id',
        'generado_por',
        'fecha_reporte',
        'anio',
        'mes',
        'payload',
    ];

    protected $casts = [
        'fecha_reporte' => 'date',
        'payload' => 'array',
    ];

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }

    public function generadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generado_por');
    }
}
