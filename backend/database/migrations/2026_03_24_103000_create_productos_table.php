<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('productos')) {
            return;
        }

        Schema::create('productos', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('categoria_id');
            $table->unsignedBigInteger('modulo_id');
            $table->string('codigo', 50);
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->decimal('precio_compra', 10, 2)->default(0);
            $table->decimal('precio_venta', 10, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('stock_minimo')->default(2);
            $table->string('unidad_medida', 50)->default('unidad');
            $table->boolean('estado')->default(true);
            $table->timestamps();

            $table->unique('codigo', 'uq_productos_codigo');
            $table->index('categoria_id', 'idx_productos_categoria_id');
            $table->index('modulo_id', 'idx_productos_modulo_id');
            $table->index('nombre', 'idx_productos_nombre');
            $table->index('estado', 'idx_productos_estado');
            $table->index('stock', 'idx_productos_stock');
            $table->index('stock_minimo', 'idx_productos_stock_minimo');
            $table->index(['modulo_id', 'estado'], 'idx_productos_modulo_estado');
            $table->index(['categoria_id', 'estado'], 'idx_productos_categoria_estado');
            $table->foreign('categoria_id', 'fk_productos_categoria')
                ->references('id')->on('categorias')->cascadeOnUpdate();
            $table->foreign('modulo_id', 'fk_productos_modulo')
                ->references('id')->on('modulos')->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
