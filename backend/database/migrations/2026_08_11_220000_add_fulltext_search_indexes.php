<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            throw new RuntimeException('The fulltext index migration requires MySQL. Run the test suite with composer test:mysql.');
        }

        Schema::table('productos', function (Blueprint $table): void {
            $table->fullText(['nombre', 'codigo'], 'ft_productos_busqueda');
        });

        Schema::table('reparaciones', function (Blueprint $table): void {
            $table->fullText(
                ['codigo_reparacion', 'marca', 'modelo'],
                'ft_reparaciones_busqueda',
            );
        });

        Schema::table('clientes', function (Blueprint $table): void {
            $table->fullText(['nombre', 'telefono'], 'ft_clientes_busqueda');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            throw new RuntimeException('The fulltext index migration requires MySQL. Run the test suite with composer test:mysql.');
        }

        Schema::table('productos', function (Blueprint $table): void {
            $table->dropFullText('ft_productos_busqueda');
        });

        Schema::table('reparaciones', function (Blueprint $table): void {
            $table->dropFullText('ft_reparaciones_busqueda');
        });

        Schema::table('clientes', function (Blueprint $table): void {
            $table->dropFullText('ft_clientes_busqueda');
        });
    }
};
