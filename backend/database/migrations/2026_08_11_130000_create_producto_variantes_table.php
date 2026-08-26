<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('producto_variantes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('detalle_venta_id')->nullable()->constrained('detalle_ventas')->nullOnDelete();
            $table->string('nombre', 100)->nullable();
            $table->string('foto_path');
            $table->boolean('disponible')->default(true);
            $table->timestamp('vendida_at')->nullable();
            $table->timestamps();

            $table->index(['producto_id', 'disponible']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producto_variantes');
    }
};
