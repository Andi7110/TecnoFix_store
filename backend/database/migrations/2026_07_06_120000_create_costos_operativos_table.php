<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('costos_operativos', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('modulo_id')->nullable()->constrained('modulos')->nullOnDelete();
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->foreignId('movimiento_caja_id')->nullable()->constrained('movimientos_caja')->nullOnDelete();
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->string('concepto');
            $table->string('categoria', 60);
            $table->string('tipo_costo', 40)->default('operativo');
            $table->string('frecuencia', 30)->default('unico');
            $table->decimal('monto', 10, 2);
            $table->date('fecha_costo');
            $table->unsignedInteger('cantidad_distribucion')->nullable();
            $table->decimal('costo_unitario_estimado', 10, 2)->nullable();
            $table->boolean('registrar_en_caja')->default(true);
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->index(['fecha_costo', 'categoria']);
            $table->index(['producto_id', 'fecha_costo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('costos_operativos');
    }
};
