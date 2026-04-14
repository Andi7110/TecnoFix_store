<?php

namespace App\Http\Requests\Ventas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCuentaTransferenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'account_number' => ['sometimes', 'nullable', 'string', 'max:120'],
            'owner_name' => ['sometimes', 'nullable', 'string', 'max:160'],
            'owner_type' => ['sometimes', 'required', Rule::in(['Natural', 'Juridico'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
