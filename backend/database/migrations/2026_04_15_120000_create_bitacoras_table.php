<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bitacoras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('usuario_nombre')->nullable();
            $table->string('modulo', 80);
            $table->string('accion', 80);
            $table->string('descripcion');
            $table->string('metodo_http', 10);
            $table->string('ruta');
            $table->unsignedSmallInteger('codigo_respuesta')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('payload')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('fecha_movimiento')->useCurrent();
            $table->timestamps();

            $table->index(['modulo', 'accion']);
            $table->index('fecha_movimiento');
            $table->index('user_id');
        });

        if (Schema::hasTable('modulos')) {
            DB::table('modulos')->updateOrInsert(
                ['nombre' => 'Bitacora'],
                [
                    'descripcion' => 'Registro de movimientos y acciones realizadas dentro del sistema.',
                    'estado' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('modulos')) {
            DB::table('modulos')->where('nombre', 'Bitacora')->delete();
        }

        Schema::dropIfExists('bitacoras');
    }
};
