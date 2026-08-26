<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('reparaciones')) {
            return;
        }

        Schema::create('reparaciones', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('cliente_id');
            $table->unsignedBigInteger('modulo_id')->nullable();
            $table->string('codigo_reparacion', 50);
            $table->string('marca', 100);
            $table->string('modelo', 100);
            $table->enum('tipo_equipo', ['celular', 'tablet', 'otro'])->default('celular');
            $table->text('problema_reportado');
            $table->text('diagnostico')->nullable();
            $table->decimal('costo_reparacion', 10, 2)->default(0);
            $table->decimal('anticipo', 10, 2)->default(0);
            $table->decimal('saldo_pendiente', 10, 2)->default(0);
            $table->dateTime('fecha_ingreso');
            $table->date('fecha_estimada_entrega')->nullable();
            $table->dateTime('fecha_entrega')->nullable();
            $table->enum('estado_reparacion', ['registrado', 'en_proceso', 'terminado', 'entregado', 'cancelado'])
                ->default('registrado');
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->unique('codigo_reparacion', 'uq_reparaciones_codigo');
            $table->index('cliente_id', 'idx_reparaciones_cliente_id');
            $table->index('modulo_id', 'idx_reparaciones_modulo_id');
            $table->index('marca', 'idx_reparaciones_marca');
            $table->index('modelo', 'idx_reparaciones_modelo');
            $table->index('estado_reparacion', 'idx_reparaciones_estado');
            $table->index('fecha_ingreso', 'idx_reparaciones_fecha_ingreso');
            $table->index('fecha_entrega', 'idx_reparaciones_fecha_entrega');
            $table->index(['cliente_id', 'estado_reparacion'], 'idx_reparaciones_cliente_estado');
            $table->index(['estado_reparacion', 'fecha_ingreso'], 'idx_reparaciones_estado_fecha');
            $table->foreign('cliente_id', 'fk_reparaciones_cliente')
                ->references('id')->on('clientes')->cascadeOnUpdate();
            $table->foreign('modulo_id', 'fk_reparaciones_modulo')
                ->references('id')->on('modulos')->nullOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        // Kept non-destructive for databases that had this table before Laravel migrations.
    }
};
