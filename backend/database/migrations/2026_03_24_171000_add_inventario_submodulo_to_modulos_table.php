<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('modulos')) {
            return;
        }

        DB::table('modulos')->updateOrInsert(
            ['nombre' => 'inventario'],
            [
                'descripcion' => 'Submodulo de inventario de productos',
                'estado' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('modulos')) {
            return;
        }

        DB::table('modulos')
            ->where('nombre', 'inventario')
            ->delete();
    }
};
