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
        'bitacora',
        'usuarios',
    ];

    public const ROLES = [
        'admin',
        'vendedor',
        'tecnico',
    ];
}
