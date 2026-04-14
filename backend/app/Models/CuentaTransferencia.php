<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CuentaTransferencia extends Model
{
    use HasFactory;

    protected $table = 'cuentas_transferencia';

    protected $fillable = [
        'bank_name',
        'account_number',
        'owner_name',
        'owner_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
