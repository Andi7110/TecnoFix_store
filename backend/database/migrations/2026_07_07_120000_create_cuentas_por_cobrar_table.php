<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuentas_por_cobrar', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('venta_id')->nullable()->constrained('ventas')->nullOnDelete();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->foreignId('modulo_id')->nullable()->constrained('modulos')->nullOnDelete();
            $table->string('codigo', 60)->unique();
            $table->string('cliente_nombre', 150);
            $table->string('cliente_telefono', 30)->nullable();
            $table->decimal('monto_original', 10, 2);
            $table->decimal('monto_pagado', 10, 2)->default(0);
            $table->decimal('saldo_pendiente', 10, 2);
            $table->dateTime('fecha_cuenta');
            $table->date('fecha_promesa_pago')->nullable();
            $table->string('estado', 30)->default('pendiente');
            $table->text('motivo')->nullable();
            $table->text('observacion')->nullable();
            $table->timestamps();
        });

        Schema::create('abonos_cuentas_por_cobrar', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cuenta_por_cobrar_id')->constrained('cuentas_por_cobrar')->cascadeOnDelete();
            $table->foreignId('movimiento_caja_id')->nullable()->constrained('movimientos_caja')->nullOnDelete();
            $table->decimal('monto', 10, 2);
            $table->dateTime('fecha_abono');
            $table->string('metodo_pago', 30)->default('efectivo');
            $table->string('referencia', 100)->nullable();
            $table->text('observacion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abonos_cuentas_por_cobrar');
        Schema::dropIfExists('cuentas_por_cobrar');
    }
};
