<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bitacora extends Model
{
    use HasFactory;

    protected $table = 'bitacoras';

    protected $fillable = [
        'user_id',
        'usuario_nombre',
        'modulo',
        'accion',
        'descripcion',
        'metodo_http',
        'ruta',
        'codigo_respuesta',
        'ip_address',
        'user_agent',
        'payload',
        'metadata',
        'fecha_movimiento',
    ];

    protected $casts = [
        'payload' => 'array',
        'metadata' => 'array',
        'fecha_movimiento' => 'datetime',
    ];

    public function scopePorModulo(Builder $query, ?string $modulo): Builder
    {
        if (blank($modulo)) {
            return $query;
        }

        return $query->where('modulo', $modulo);
    }

    public function scopePorAccion(Builder $query, ?string $accion): Builder
    {
        if (blank($accion)) {
            return $query;
        }

        return $query->where('accion', $accion);
    }

    public function scopeBuscar(Builder $query, ?string $termino): Builder
    {
        if (blank($termino)) {
            return $query;
        }

        return $query->where(function (Builder $innerQuery) use ($termino): void {
            $innerQuery
                ->where('descripcion', 'like', '%'.$termino.'%')
                ->orWhere('usuario_nombre', 'like', '%'.$termino.'%')
                ->orWhere('ruta', 'like', '%'.$termino.'%');
        });
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
