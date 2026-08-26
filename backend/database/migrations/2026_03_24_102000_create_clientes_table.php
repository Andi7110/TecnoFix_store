<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('clientes')) {
            return;
        }

        Schema::create('clientes', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 150);
            $table->string('telefono', 30)->nullable();
            $table->string('direccion')->nullable();
            $table->string('email', 150)->nullable();
            $table->string('documento', 50)->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();

            $table->index('nombre', 'idx_clientes_nombre');
            $table->index('telefono', 'idx_clientes_telefono');
            $table->index('documento', 'idx_clientes_documento');
            $table->index('estado', 'idx_clientes_estado');
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
