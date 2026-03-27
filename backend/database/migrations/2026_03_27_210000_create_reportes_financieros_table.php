<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes_financieros', function (Blueprint $table): void {
            $table->id();
            $table->string('tipo_reporte', 60);
            $table->string('titulo', 180);
            $table->foreignId('modulo_id')->nullable()->constrained('modulos')->nullOnDelete();
            $table->foreignId('generado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->date('fecha_reporte')->nullable();
            $table->unsignedSmallInteger('anio')->nullable();
            $table->unsignedTinyInteger('mes')->nullable();
            $table->json('payload');
            $table->timestamps();

            $table->index(['tipo_reporte', 'fecha_reporte']);
            $table->index(['tipo_reporte', 'anio', 'mes']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes_financieros');
    }
};
