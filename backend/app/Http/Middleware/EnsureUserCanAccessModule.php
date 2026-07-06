<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanAccessModule
{
    public function handle(Request $request, Closure $next, string ...$modules): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            abort(403, 'Usuario inactivo o sin permisos.');
        }

        foreach ($modules as $module) {
            if ($user->canAccessModule($module)) {
                return $next($request);
            }
        }

        abort(403, 'No tienes permiso para acceder a este modulo.');
    }
}
