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

        if (! Auth::attempt([
            'username' => $credentials['username'],
            'password' => $credentials['password'],
        ], $remember)) {
            throw ValidationException::withMessages([
                'username' => ['Credenciales invalidas.'],
            ]);
        }

        $request->session()->regenerate();

        return $request->user()->fresh();
    }
}
