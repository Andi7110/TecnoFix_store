<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CreateAdminCommand extends Command
{
    protected $signature = 'app:create-admin
        {--name= : Nombre completo del administrador}
        {--username= : Nombre de usuario}
        {--email= : Correo electronico opcional}';

    protected $description = 'Crea de forma segura el primer usuario administrador';

    public function handle(): int
    {
        $name = trim((string) ($this->option('name') ?: $this->ask('Nombre completo')));
        $username = strtolower(trim((string) ($this->option('username') ?: $this->ask('Nombre de usuario'))));
        $emailInput = $this->option('email');
        $email = strtolower(trim((string) ($emailInput !== null
            ? $emailInput
            : $this->ask('Correo electronico (opcional)'))));
        $email = $email !== '' ? $email : null;

        $profileValidator = Validator::make([
            'name' => $name,
            'username' => $username,
            'email' => $email,
        ], [
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('users', 'username')],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('users', 'email')],
        ]);

        if ($profileValidator->fails()) {
            $this->displayValidationErrors($profileValidator->errors()->all());

            return self::FAILURE;
        }

        $password = (string) $this->secret('Contrasena (minimo 12 caracteres)');
        $passwordConfirmation = (string) $this->secret('Confirma la contrasena');

        if (! hash_equals($password, $passwordConfirmation)) {
            $this->error('Las contrasenas no coinciden. No se creo ningun usuario.');

            return self::FAILURE;
        }

        $passwordValidator = Validator::make([
            'password' => $password,
        ], [
            'password' => [
                'required',
                'string',
                'max:255',
                Password::min(12)->letters()->mixedCase()->numbers()->symbols(),
            ],
        ]);

        if ($passwordValidator->fails()) {
            $this->displayValidationErrors($passwordValidator->errors()->all());

            return self::FAILURE;
        }

        User::create([
            'name' => $name,
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'role' => 'admin',
            'allowed_modules' => null,
            'is_active' => true,
        ]);

        $this->info("Administrador '{$username}' creado correctamente.");

        return self::SUCCESS;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function displayValidationErrors(array $errors): void
    {
        foreach ($errors as $error) {
            $this->error($error);
        }
    }
}
