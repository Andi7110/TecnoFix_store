<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('detalle_ventas')) {
            return;
        }

        Schema::create('detalle_ventas', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('venta_id');
            $table->unsignedBigInteger('producto_id')->nullable();
            $table->string('descripcion_item');
            $table->integer('cantidad')->default(1);
            $table->decimal('precio_unitario', 10, 2)->default(0);
            $table->decimal('costo_unitario', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('ganancia_item', 10, 2)->default(0);
            $table->timestamps();

            $table->index('venta_id', 'idx_detalle_ventas_venta_id');
            $table->index('producto_id', 'idx_detalle_ventas_producto_id');
            $table->index('descripcion_item', 'idx_detalle_ventas_descripcion_item');
            $table->index(['venta_id', 'producto_id'], 'idx_detalle_ventas_venta_producto');
            $table->foreign('producto_id', 'fk_detalle_ventas_producto')
                ->references('id')->on('productos')->nullOnDelete()->cascadeOnUpdate();
            $table->foreign('venta_id', 'fk_detalle_ventas_venta')
                ->references('id')->on('ventas')->cascadeOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
