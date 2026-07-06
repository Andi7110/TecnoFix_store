<?php

namespace App\Http\Requests\Usuarios;

use App\Support\Auth\AccessModules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('users', 'username')],
            'email' => ['nullable', 'email', 'max:150', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'role' => ['required', 'string', Rule::in(AccessModules::ROLES)],
            'allowed_modules' => ['array'],
            'allowed_modules.*' => ['string', Rule::in(AccessModules::ALL)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => strtolower(trim((string) $this->input('username'))),
            'email' => $this->filled('email') ? strtolower(trim((string) $this->input('email'))) : null,
            'allowed_modules' => $this->input('role') === 'admin'
                ? AccessModules::ALL
                : array_values(array_diff(array_unique($this->input('allowed_modules', [])), ['usuarios'])),
            'is_active' => $this->boolean('is_active', true),
        ]);
    }
}
