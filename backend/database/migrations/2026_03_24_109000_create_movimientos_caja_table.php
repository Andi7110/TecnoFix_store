<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('movimientos_caja')) {
            return;
        }

        Schema::create('movimientos_caja', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('modulo_id')->nullable();
            $table->enum('tipo_movimiento', ['entrada', 'salida']);
            $table->enum('categoria_movimiento', [
                'venta',
                'gasto',
                'costo_fijo',
                'reparacion',
                'retiro',
                'ingreso_manual',
                'ajuste_caja',
                'compra_productos',
            ]);
            $table->string('concepto');
            $table->decimal('monto', 10, 2);
            $table->dateTime('fecha_movimiento');
            $table->string('referencia', 100)->nullable();
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->index('modulo_id', 'idx_movimientos_caja_modulo_id');
            $table->index('tipo_movimiento', 'idx_movimientos_caja_tipo');
            $table->index('categoria_movimiento', 'idx_movimientos_caja_categoria');
            $table->index('fecha_movimiento', 'idx_movimientos_caja_fecha');
            $table->index(['modulo_id', 'fecha_movimiento'], 'idx_movimientos_caja_modulo_fecha');
            $table->index(['tipo_movimiento', 'fecha_movimiento'], 'idx_movimientos_caja_tipo_fecha');
            $table->foreign('modulo_id', 'fk_movimientos_caja_modulo')
                ->references('id')->on('modulos')->nullOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
