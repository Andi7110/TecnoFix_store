<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('inventario_productos')) {
            return;
        }

        Schema::create('inventario_productos', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('modulo_id')->constrained('modulos');
            $table->foreignId('categoria_id')->constrained('categorias');
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->string('codigo', 50);
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('foto_path')->nullable();
            $table->decimal('precio_compra', 10, 2);
            $table->decimal('precio_venta', 10, 2);
            $table->integer('stock_inicial')->default(0);
            $table->integer('stock_minimo')->default(2);
            $table->string('unidad_medida', 50)->default('unidad');
            $table->boolean('estado')->default(true);
            $table->timestamp('fecha_registro');
            $table->timestamps();

            $table->index(['modulo_id', 'fecha_registro'], 'idx_inv_prod_modulo_fecha');
            $table->index(['categoria_id', 'fecha_registro'], 'idx_inv_prod_categoria_fecha');
            $table->index('codigo', 'idx_inv_prod_codigo');
            $table->index('nombre', 'idx_inv_prod_nombre');
            $table->index('fecha_registro', 'idx_inv_prod_fecha_registro');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventario_productos');
    }
};
