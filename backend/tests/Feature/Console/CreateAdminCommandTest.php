<?php

namespace Tests\Feature\Console;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\Console\Command\Command as SymfonyCommand;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_active_admin_with_a_hidden_password_prompt(): void
    {
        $this->artisan('app:create-admin', [
            '--name' => 'Administrador TecnoFix',
            '--username' => 'AdminPrincipal',
            '--email' => 'ADMIN@example.com',
        ])
            ->expectsQuestion('Contrasena (minimo 12 caracteres)', 'ClaveSegura123!')
            ->expectsQuestion('Confirma la contrasena', 'ClaveSegura123!')
            ->expectsOutput("Administrador 'adminprincipal' creado correctamente.")
            ->assertSuccessful();

        $admin = User::query()->where('username', 'adminprincipal')->firstOrFail();

        $this->assertSame('Administrador TecnoFix', $admin->name);
        $this->assertSame('admin@example.com', $admin->email);
        $this->assertSame('admin', $admin->role);
        $this->assertTrue($admin->is_active);
        $this->assertTrue(Hash::check('ClaveSegura123!', $admin->password));
    }

    public function test_it_rejects_a_duplicate_username_without_changing_the_user(): void
    {
        $existingAdmin = User::factory()->create([
            'username' => 'adminprincipal',
            'email' => 'original@example.com',
        ]);

        $this->artisan('app:create-admin', [
            '--name' => 'Otro administrador',
            '--username' => 'AdminPrincipal',
            '--email' => 'otro@example.com',
        ])->assertExitCode(SymfonyCommand::FAILURE);

        $this->assertSame(1, User::query()->count());
        $this->assertSame('original@example.com', $existingAdmin->fresh()->email);
    }

    public function test_it_rejects_mismatched_passwords(): void
    {
        $this->artisan('app:create-admin', [
            '--name' => 'Administrador TecnoFix',
            '--username' => 'adminprincipal',
            '--email' => '',
        ])
            ->expectsQuestion('Contrasena (minimo 12 caracteres)', 'ClaveSegura123!')
            ->expectsQuestion('Confirma la contrasena', 'OtraClave123!')
            ->expectsOutput('Las contrasenas no coinciden. No se creo ningun usuario.')
            ->assertExitCode(SymfonyCommand::FAILURE);

        $this->assertDatabaseCount('users', 0);
    }
}
