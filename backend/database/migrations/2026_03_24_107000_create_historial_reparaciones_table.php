<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('historial_reparaciones')) {
            return;
        }

        Schema::create('historial_reparaciones', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('reparacion_id');
            $table->string('estado_anterior', 50)->nullable();
            $table->string('estado_nuevo', 50);
            $table->text('comentario')->nullable();
            $table->dateTime('fecha_cambio');
            $table->timestamps();

            $table->index('reparacion_id', 'idx_historial_reparaciones_reparacion_id');
            $table->index('estado_nuevo', 'idx_historial_reparaciones_estado_nuevo');
            $table->index('fecha_cambio', 'idx_historial_reparaciones_fecha_cambio');
            $table->index(['reparacion_id', 'fecha_cambio'], 'idx_historial_reparaciones_reparacion_fecha');
            $table->foreign('reparacion_id', 'fk_historial_reparaciones_reparacion')
                ->references('id')->on('reparaciones')->cascadeOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
