<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_load_authenticated_user(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_user_can_login_fetch_me_and_logout(): void
    {
        $user = User::factory()->create([
            'username' => 'admin',
            'password' => 'password',
        ]);

        $this->postJson('/api/auth/login', [
            'username' => $user->username,
            'password' => 'password',
            'remember' => true,
        ])->assertOk()->assertJsonPath('data.username', $user->username);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->postJson('/api/auth/logout')->assertNoContent();

        $this->assertGuest('web');
    }
}
