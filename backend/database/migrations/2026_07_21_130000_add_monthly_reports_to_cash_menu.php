<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('menu')) {
            return;
        }

        $cashId = DB::table('menu')->where('ruta', '/caja')->value('id');

        if (! $cashId) {
            return;
        }

        DB::table('menu')->updateOrInsert(
            ['ruta' => '/caja/reportes'],
            [
                'parent_id' => $cashId,
                'nombre' => 'Reportes mensuales',
                'modulo' => 'caja',
                'icono' => 'reports',
                'orden' => 5,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );
    }

    public function down(): void
    {
        if (Schema::hasTable('menu')) {
            DB::table('menu')->where('ruta', '/caja/reportes')->delete();
        }
    }
};
