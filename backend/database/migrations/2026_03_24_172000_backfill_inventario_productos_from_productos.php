<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('productos') || ! Schema::hasTable('inventario_productos')) {
            return;
        }

        DB::statement('
            INSERT INTO inventario_productos (
                producto_id,
                modulo_id,
                categoria_id,
                registrado_por,
                codigo,
                nombre,
                descripcion,
                foto_path,
                precio_compra,
                precio_venta,
                stock_inicial,
                stock_minimo,
                unidad_medida,
                estado,
                fecha_registro,
                created_at,
                updated_at
            )
            SELECT
                p.id,
                p.modulo_id,
                p.categoria_id,
                NULL,
                p.codigo,
                p.nombre,
                p.descripcion,
                p.foto_path,
                p.precio_compra,
                p.precio_venta,
                p.stock,
                p.stock_minimo,
                p.unidad_medida,
                p.estado,
                COALESCE(p.created_at, NOW()),
                NOW(),
                NOW()
            FROM productos p
            WHERE NOT EXISTS (
                SELECT 1
                FROM inventario_productos ip
                WHERE ip.producto_id = p.id
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversible backfill.
    }
};
