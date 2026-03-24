<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventarioProducto extends Model
{
    use HasFactory;

    protected $table = 'inventario_productos';

    protected $fillable = [
        'producto_id',
        'modulo_id',
        'categoria_id',
        'registrado_por',
        'codigo',
        'nombre',
        'descripcion',
        'foto_path',
        'precio_compra',
        'precio_venta',
        'stock_inicial',
        'stock_minimo',
        'unidad_medida',
        'estado',
        'fecha_registro',
    ];

    protected $casts = [
        'precio_compra' => 'decimal:2',
        'precio_venta' => 'decimal:2',
        'stock_inicial' => 'integer',
        'stock_minimo' => 'integer',
        'estado' => 'boolean',
        'fecha_registro' => 'datetime',
    ];

    public function scopePorModulo(Builder $query, int|string|null $moduloId): Builder
    {
        if (blank($moduloId)) {
            return $query;
        }

        return $query->where('modulo_id', $moduloId);
    }

    public function scopePorCategoria(Builder $query, int|string|null $categoriaId): Builder
    {
        if (blank($categoriaId)) {
            return $query;
        }

        return $query->where('categoria_id', $categoriaId);
    }

    public function scopeBuscarCodigo(Builder $query, ?string $codigo): Builder
    {
        if (blank($codigo)) {
            return $query;
        }

        return $query->where('codigo', 'like', '%'.$codigo.'%');
    }

    public function scopeBuscarNombre(Builder $query, ?string $nombre): Builder
    {
        if (blank($nombre)) {
            return $query;
        }

        return $query->where('nombre', 'like', '%'.$nombre.'%');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }
}
