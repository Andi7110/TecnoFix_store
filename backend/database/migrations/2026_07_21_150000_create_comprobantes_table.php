<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comprobantes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('costo_operativo_id')->nullable()->constrained('costos_operativos')->cascadeOnDelete();
            $table->foreignId('movimiento_caja_id')->nullable()->constrained('movimientos_caja')->cascadeOnDelete();
            $table->foreignId('subido_por')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tipo_documento', 30)->default('otro');
            $table->string('proveedor')->nullable();
            $table->date('fecha_documento')->nullable();
            $table->date('periodo_desde')->nullable();
            $table->date('periodo_hasta')->nullable();
            $table->unsignedInteger('dias_cobrados')->nullable();
            $table->decimal('tarifa_diaria', 10, 2)->nullable();
            $table->string('nombre_original');
            $table->string('ruta');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('tamano');
            $table->timestamps();

            $table->index(['fecha_documento', 'tipo_documento']);
            $table->index(['costo_operativo_id', 'movimiento_caja_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comprobantes');
    }
};
