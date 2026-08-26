<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('movimientos_inventario')) {
            return;
        }

        Schema::create('movimientos_inventario', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('producto_id');
            $table->enum('tipo_movimiento', ['entrada', 'salida', 'ajuste']);
            $table->integer('cantidad');
            $table->integer('stock_anterior');
            $table->integer('stock_nuevo');
            $table->enum('motivo', ['compra', 'venta', 'correccion', 'perdida', 'producto_danado', 'ingreso_manual']);
            $table->string('referencia', 100)->nullable();
            $table->dateTime('fecha_movimiento');
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->index('producto_id', 'idx_movimientos_inventario_producto_id');
            $table->index('tipo_movimiento', 'idx_movimientos_inventario_tipo');
            $table->index('motivo', 'idx_movimientos_inventario_motivo');
            $table->index('fecha_movimiento', 'idx_movimientos_inventario_fecha');
            $table->index(['producto_id', 'fecha_movimiento'], 'idx_movimientos_inventario_producto_fecha');
            $table->foreign('producto_id', 'fk_movimientos_inventario_producto')
                ->references('id')->on('productos')->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
