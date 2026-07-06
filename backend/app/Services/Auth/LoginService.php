<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginService
{
    public function execute(Request $request, array $credentials): User
    {
        $remember = (bool) ($credentials['remember'] ?? false);

        $authenticated = Auth::attempt([
            'username' => $credentials['username'],
            'password' => $credentials['password'],
        ], $remember);

        if (! $authenticated) {
            throw ValidationException::withMessages([
                'username' => ['Credenciales invalidas.'],
            ]);
        }

        if (! $request->user()?->is_active) {
            Auth::logout();

            throw ValidationException::withMessages([
                'username' => ['Usuario inactivo. Contacta al administrador.'],
            ]);
        }

        $request->session()->regenerate();

        return $request->user()->fresh();
    }
}
