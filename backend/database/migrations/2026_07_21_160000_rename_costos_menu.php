<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('menu')->where('ruta', '/costos')->update([
            'nombre' => 'Gastos y compras',
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('menu')->where('ruta', '/costos')->update([
            'nombre' => 'Costos',
            'updated_at' => now(),
        ]);
    }
};
