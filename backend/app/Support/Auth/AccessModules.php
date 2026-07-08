<?php

namespace App\Support\Auth;

class AccessModules
{
    public const ALL = [
        'dashboard',
        'inventario',
        'ventas',
        'reparaciones',
        'caja',
        'costos',
        'cuentas_cobrar',
        'bitacora',
        'usuarios',
    ];

    public const ROLES = [
        'admin',
        'vendedor',
        'tecnico',
    ];
}
