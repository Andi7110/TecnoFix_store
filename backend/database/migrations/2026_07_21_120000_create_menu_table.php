<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('menu')->cascadeOnDelete();
            $table->string('nombre', 80);
            $table->string('ruta', 120)->unique();
            $table->string('modulo', 60);
            $table->string('icono', 40)->nullable();
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('estado')->default(true);
            $table->timestamps();

            $table->index(['parent_id', 'estado', 'orden']);
        });

        $now = now();
        $cajaId = DB::table('menu')->insertGetId([
            'parent_id' => null,
            'nombre' => 'Caja',
            'ruta' => '/caja',
            'modulo' => 'caja',
            'icono' => 'cash',
            'orden' => 50,
            'estado' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('menu')->insert([
            [
                'parent_id' => $cajaId,
                'nombre' => 'Reportes mensuales',
                'ruta' => '/caja/reportes',
                'modulo' => 'caja',
                'icono' => 'reports',
                'orden' => 5,
                'estado' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'parent_id' => $cajaId,
                'nombre' => 'Costos',
                'ruta' => '/costos',
                'modulo' => 'costos',
                'icono' => 'reports',
                'orden' => 10,
                'estado' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'parent_id' => $cajaId,
                'nombre' => 'Cuentas por cobrar',
                'ruta' => '/cuentas-por-cobrar',
                'modulo' => 'cuentas_cobrar',
                'icono' => 'cash',
                'orden' => 20,
                'estado' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('menu');
    }
};
