<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('categorias')) {
            return;
        }

        Schema::create('categorias', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('modulo_id');
            $table->string('nombre', 100);
            $table->string('descripcion')->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();

            $table->unique(['modulo_id', 'nombre'], 'uq_categorias_modulo_nombre');
            $table->index('modulo_id', 'idx_categorias_modulo_id');
            $table->index('estado', 'idx_categorias_estado');
            $table->foreign('modulo_id', 'fk_categorias_modulo')
                ->references('id')->on('modulos')->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
