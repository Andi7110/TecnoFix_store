<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbonoCuentaPorCobrar extends Model
{
    use HasFactory;

    protected $table = 'abonos_cuentas_por_cobrar';

    protected $fillable = [
        'cuenta_por_cobrar_id',
        'movimiento_caja_id',
        'monto',
        'fecha_abono',
        'metodo_pago',
        'referencia',
        'observacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_abono' => 'datetime',
    ];

    public function cuentaPorCobrar(): BelongsTo
    {
        return $this->belongsTo(CuentaPorCobrar::class);
    }

    public function movimientoCaja(): BelongsTo
    {
        return $this->belongsTo(MovimientoCaja::class);
    }
}
