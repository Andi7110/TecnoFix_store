<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MenuTest extends TestCase
{
    public function test_authenticated_user_can_load_cash_menu_with_its_children(): void
    {
        Schema::create('menu', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('nombre');
            $table->string('ruta');
            $table->string('modulo');
            $table->string('icono')->nullable();
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('estado')->default(true);
            $table->timestamps();
        });

        $cajaId = DB::table('menu')->insertGetId([
            'nombre' => 'Caja',
            'ruta' => '/caja',
            'modulo' => 'caja',
            'orden' => 50,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('menu')->insert([
            [
                'parent_id' => $cajaId,
                'nombre' => 'Reportes mensuales',
                'ruta' => '/caja/reportes',
                'modulo' => 'caja',
                'orden' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $cajaId,
                'nombre' => 'Costos',
                'ruta' => '/costos',
                'modulo' => 'costos',
                'orden' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => $cajaId,
                'nombre' => 'Cuentas por cobrar',
                'ruta' => '/cuentas-por-cobrar',
                'modulo' => 'cuentas_cobrar',
                'orden' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $user = User::factory()->make(['id' => 1]);

        $this->actingAs($user)
            ->getJson('/api/menu')
            ->assertOk()
            ->assertJsonPath('data.0.nombre', 'Caja')
            ->assertJsonPath('data.0.children.0.nombre', 'Reportes mensuales')
            ->assertJsonPath('data.0.children.1.nombre', 'Costos')
            ->assertJsonPath('data.0.children.2.nombre', 'Cuentas por cobrar');
    }
}
