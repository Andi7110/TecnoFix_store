<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $cajaId = DB::table('menu')->where('ruta', '/caja')->value('id');

        if ($cajaId && ! DB::table('menu')->where('ruta', '/caja/comprobantes')->exists()) {
            DB::table('menu')->insert([
                'parent_id' => $cajaId,
                'nombre' => 'Comprobantes',
                'ruta' => '/caja/comprobantes',
                'modulo' => 'caja',
                'icono' => 'reports',
                'orden' => 7,
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('menu')->where('ruta', '/caja/comprobantes')->delete();
    }
};
