<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'productos';

    protected $fillable = [
        'categoria_id',
        'modulo_id',
        'codigo',
        'nombre',
        'descripcion',
        'foto_path',
        'precio_compra',
        'precio_venta',
        'stock',
        'stock_minimo',
        'unidad_medida',
        'estado',
    ];

    protected $casts = [
        'precio_compra' => 'decimal:2',
        'precio_venta' => 'decimal:2',
        'stock' => 'integer',
        'stock_minimo' => 'integer',
        'estado' => 'boolean',
    ];

    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('estado', true);
    }

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

    public function scopeStockBajo(Builder $query, bool $soloStockBajo = true): Builder
    {
        if (! $soloStockBajo) {
            return $query;
        }

        return $query->whereColumn('stock', '<=', 'stock_minimo');
    }

    public function scopeBuscar(Builder $query, ?string $termino): Builder
    {
        if (blank($termino)) {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($termino): void {
            $builder
                ->where('nombre', 'like', '%'.$termino.'%')
                ->orWhere('codigo', 'like', '%'.$termino.'%');
        });
    }

    public function scopeBuscarNombre(Builder $query, ?string $nombre): Builder
    {
        if (blank($nombre)) {
            return $query;
        }

        return $query->where('nombre', 'like', '%'.$nombre.'%');
    }

    public function scopeBuscarCodigo(Builder $query, ?string $codigo): Builder
    {
        if (blank($codigo)) {
            return $query;
        }

        return $query->where('codigo', 'like', '%'.$codigo.'%');
    }

    public function scopePrecioVentaDesde(Builder $query, int|float|string|null $precioMin): Builder
    {
        if (blank($precioMin)) {
            return $query;
        }

        return $query->where('precio_venta', '>=', $precioMin);
    }

    public function scopePrecioVentaHasta(Builder $query, int|float|string|null $precioMax): Builder
    {
        if (blank($precioMax)) {
            return $query;
        }

        return $query->where('precio_venta', '<=', $precioMax);
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }

    public function movimientosInventario(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class);
    }

    public function detalleVentas(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }
}
