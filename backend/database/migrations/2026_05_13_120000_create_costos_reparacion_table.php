<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('costos_reparacion', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reparacion_id')->constrained('reparaciones')->cascadeOnDelete();
            $table->foreignId('movimiento_caja_id')->nullable()->constrained('movimientos_caja')->nullOnDelete();
            $table->string('tipo_costo', 40);
            $table->string('descripcion', 180);
            $table->decimal('monto', 10, 2);
            $table->dateTime('fecha_costo');
            $table->string('proveedor', 150)->nullable();
            $table->string('referencia', 100)->nullable();
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->index(['reparacion_id', 'fecha_costo']);
            $table->index(['tipo_costo', 'fecha_costo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('costos_reparacion');
    }
};
