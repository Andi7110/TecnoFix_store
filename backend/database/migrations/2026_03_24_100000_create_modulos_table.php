<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('modulos')) {
            return;
        }

        Schema::create('modulos', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 100);
            $table->string('descripcion')->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();

            $table->unique('nombre', 'uq_modulos_nombre');
            $table->index('estado', 'idx_modulos_estado');
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
