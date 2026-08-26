<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModuloSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $modules = [
            ['nombre' => 'Accesorios', 'descripcion' => 'Venta de accesorios para celulares'],
            ['nombre' => 'libreria', 'descripcion' => 'Venta de productos de librería'],
            ['nombre' => 'copias_impresiones', 'descripcion' => 'Servicios de copias e impresiones'],
            ['nombre' => 'reparaciones', 'descripcion' => 'Servicio de reparación de celulares'],
            ['nombre' => 'caja_general', 'descripcion' => 'Control general de caja'],
            ['nombre' => 'inventario', 'descripcion' => 'Submodulo de inventario de productos'],
            ['nombre' => 'Bitacora', 'descripcion' => 'Registro de movimientos y acciones realizadas dentro del sistema.'],
        ];

        foreach ($modules as $module) {
            DB::table('modulos')->updateOrInsert(
                ['nombre' => $module['nombre']],
                [...$module, 'estado' => true, 'created_at' => $now, 'updated_at' => $now],
            );
        }
    }
}
