<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('costos_fijos')) {
            return;
        }

        Schema::create('costos_fijos', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 100);
            $table->string('descripcion')->nullable();
            $table->decimal('monto', 10, 2);
            $table->enum('frecuencia', ['diario', 'semanal', 'mensual']);
            $table->boolean('estado')->default(true);
            $table->timestamps();

            $table->unique('nombre', 'uq_costos_fijos_nombre');
            $table->index('frecuencia', 'idx_costos_fijos_frecuencia');
            $table->index('estado', 'idx_costos_fijos_estado');
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
