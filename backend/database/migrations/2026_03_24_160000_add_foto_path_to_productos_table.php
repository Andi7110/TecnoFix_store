<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('productos') || Schema::hasColumn('productos', 'foto_path')) {
            return;
        }

        Schema::table('productos', function (Blueprint $table): void {
            $table->string('foto_path')->nullable()->after('descripcion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('productos') || ! Schema::hasColumn('productos', 'foto_path')) {
            return;
        }

        Schema::table('productos', function (Blueprint $table): void {
            $table->dropColumn('foto_path');
        });
    }
};
