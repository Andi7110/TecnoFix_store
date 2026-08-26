<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('registro_costos_fijos')) {
            return;
        }

        Schema::create('registro_costos_fijos', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('costo_fijo_id');
            $table->date('fecha_registro');
            $table->decimal('monto', 10, 2);
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->index('costo_fijo_id', 'idx_registro_costos_fijos_costo_id');
            $table->index('fecha_registro', 'idx_registro_costos_fijos_fecha');
            $table->index(['costo_fijo_id', 'fecha_registro'], 'idx_registro_costos_fijos_costo_fecha');
            $table->foreign('costo_fijo_id', 'fk_registro_costos_fijos_costo')
                ->references('id')->on('costos_fijos')->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
