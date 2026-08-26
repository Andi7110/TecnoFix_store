<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ventas')) {
            return;
        }

        Schema::create('ventas', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('modulo_id');
            $table->string('numero_venta', 50);
            $table->dateTime('fecha_venta');
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('descuento', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->enum('metodo_pago', ['efectivo', 'transferencia', 'tarjeta', 'mixto'])->default('efectivo');
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->unique('numero_venta', 'uq_ventas_numero_venta');
            $table->index('modulo_id', 'idx_ventas_modulo_id');
            $table->index('fecha_venta', 'idx_ventas_fecha_venta');
            $table->index('metodo_pago', 'idx_ventas_metodo_pago');
            $table->index(['modulo_id', 'fecha_venta'], 'idx_ventas_modulo_fecha');
            $table->index('total', 'idx_ventas_total');
            $table->foreign('modulo_id', 'fk_ventas_modulo')
                ->references('id')->on('modulos')->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
