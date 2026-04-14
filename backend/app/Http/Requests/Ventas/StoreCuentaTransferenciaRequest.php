<?php

namespace App\Http\Requests\Ventas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCuentaTransferenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_name' => ['nullable', 'string', 'max:120'],
            'account_number' => ['nullable', 'string', 'max:120'],
            'owner_name' => ['nullable', 'string', 'max:160'],
            'owner_type' => ['required', Rule::in(['Natural', 'Juridico'])],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
