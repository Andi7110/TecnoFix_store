<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_load_cash_menu_with_its_children(): void
    {
        $user = User::factory()->make(['id' => 1]);

        $this->actingAs($user)
            ->getJson('/api/menu')
            ->assertOk()
            ->assertJsonPath('data.0.nombre', 'Caja')
            ->assertJsonPath('data.0.children.0.nombre', 'Reportes mensuales')
            ->assertJsonPath('data.0.children.1.nombre', 'Comprobantes')
            ->assertJsonPath('data.0.children.2.nombre', 'Gastos y compras')
            ->assertJsonPath('data.0.children.3.nombre', 'Cuentas por cobrar');
    }
}
