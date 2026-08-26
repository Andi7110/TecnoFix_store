<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            throw new RuntimeException('The movimientos_caja enum migration requires MySQL. Run the test suite with composer test:mysql.');
        }

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
                'cuenta_por_cobrar',
                'saldo_inicial'
            ) NOT NULL
        ");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            throw new RuntimeException('The movimientos_caja enum migration requires MySQL. Run the test suite with composer test:mysql.');
        }

        DB::table('movimientos_caja')
            ->where('categoria_movimiento', 'saldo_inicial')
            ->update(['categoria_movimiento' => 'ajuste_caja']);

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
};
