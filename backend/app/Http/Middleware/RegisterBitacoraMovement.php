<?php

namespace App\Http\Middleware;

use App\Models\Bitacora;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RegisterBitacoraMovement
{
    private const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldRegister($request, $response)) {
            $this->register($request, $response);
        }

        return $response;
    }

    private function shouldRegister(Request $request, Response $response): bool
    {
        return in_array($request->method(), self::WRITE_METHODS, true)
            && $response->getStatusCode() < 400
            && ! $request->is('api/bitacora*')
            && ! $request->is('api/auth/login')
            && ! $request->is('api/auth/logout');
    }

    private function register(Request $request, Response $response): void
    {
        try {
            $user = $request->user();

            Bitacora::create([
                'user_id' => $user?->id,
                'usuario_nombre' => $user?->name,
                'modulo' => $this->resolveModule($request),
                'accion' => $this->resolveAction($request->method()),
                'descripcion' => $this->buildDescription($request),
                'metodo_http' => $request->method(),
                'ruta' => '/'.$request->path(),
                'codigo_respuesta' => $response->getStatusCode(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'payload' => $this->sanitizePayload($request->except([
                    'password',
                    'password_confirmation',
                    'token',
                    'foto',
                    'imagen',
                ])),
                'metadata' => [
                    'route_name' => $request->route()?->getName(),
                    'route_parameters' => $this->normalizeRouteParameters($request->route()?->parameters() ?? []),
                ],
                'fecha_movimiento' => now(),
            ]);
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function resolveModule(Request $request): string
    {
        $segments = $request->segments();
        $module = $segments[1] ?? 'sistema';

        return match ($module) {
            'inventario' => 'Inventario',
            'productos' => 'Productos',
            'ventas' => 'Ventas',
            'reparaciones' => 'Reparaciones',
            'caja' => 'Caja',
            default => ucfirst(str_replace('-', ' ', $module)),
        };
    }

    private function resolveAction(string $method): string
    {
        return match ($method) {
            'POST' => 'crear',
            'PUT', 'PATCH' => 'actualizar',
            'DELETE' => 'eliminar',
            default => 'otro',
        };
    }

    private function buildDescription(Request $request): string
    {
        $action = $this->resolveAction($request->method());
        $module = $this->resolveModule($request);

        return ucfirst($action).' registro en '.$module;
    }

    private function sanitizePayload(array $payload): array
    {
        return collect($payload)
            ->map(function ($value) {
                if (is_string($value) && strlen($value) > 500) {
                    return substr($value, 0, 500).'...';
                }

                return $value;
            })
            ->all();
    }

    private function normalizeRouteParameters(array $parameters): array
    {
        return collect($parameters)
            ->map(function ($value) {
                if (is_object($value) && method_exists($value, 'getKey')) {
                    return $value->getKey();
                }

                return $value;
            })
            ->all();
    }
}
