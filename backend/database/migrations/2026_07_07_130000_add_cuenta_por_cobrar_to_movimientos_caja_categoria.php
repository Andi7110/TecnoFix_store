<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE movimientos_caja
            MODIFY categoria_movimiento ENUM(
                'venta',
                'gasto',
                'costo_fijo',
                'reparacion',
                'retiro',
                'ingreso_manual',
                'ajuste_caja',
                'compra_productos',
                'cuenta_por_cobrar'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        DB::table('movimientos_caja')
            ->where('categoria_movimiento', 'cuenta_por_cobrar')
            ->update(['categoria_movimiento' => 'ingreso_manual']);

        DB::statement("
            ALTER TABLE movimientos_caja
            MODIFY categoria_movimiento ENUM(
                'venta',
                'gasto',
                'costo_fijo',
                'reparacion',
                'retiro',
                'ingreso_manual',
                'ajuste_caja',
                'compra_productos'
            ) NOT NULL
        ");
    }
};
