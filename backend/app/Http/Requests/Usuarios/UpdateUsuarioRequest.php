<?php

namespace App\Http\Requests\Usuarios;

use App\Models\User;
use App\Support\Auth\AccessModules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        /** @var User|null $usuario */
        $usuario = $this->route('usuario');

        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'username' => ['sometimes', 'string', 'max:50', 'alpha_dash', Rule::unique('users', 'username')->ignore($usuario?->id)],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('users', 'email')->ignore($usuario?->id)],
            'password' => ['nullable', 'string', 'min:8', 'max:255'],
            'role' => ['sometimes', 'string', Rule::in(AccessModules::ROLES)],
            'allowed_modules' => ['array'],
            'allowed_modules.*' => ['string', Rule::in(AccessModules::ALL)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $payload = [];

        if ($this->has('username')) {
            $payload['username'] = strtolower(trim((string) $this->input('username')));
        }

        if ($this->has('email')) {
            $payload['email'] = $this->filled('email') ? strtolower(trim((string) $this->input('email'))) : null;
        }

        $role = $this->input('role', $this->route('usuario')?->role);

        if ($this->has('allowed_modules') || $this->has('role')) {
            $payload['allowed_modules'] = $role === 'admin'
                ? AccessModules::ALL
                : array_values(array_diff(array_unique($this->input('allowed_modules', [])), ['usuarios']));
        }

        if ($this->has('is_active')) {
            $payload['is_active'] = $this->boolean('is_active');
        }

        $this->merge($payload);
    }
}
