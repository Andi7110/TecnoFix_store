<?php

namespace App\Mcp\Tools;

use App\Models\Reparacion;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsOpenWorld;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('consultar-reparacion')]
#[Description('Consulta una reparacion de TecnoFix mediante su codigo exacto o su ID numerico. Devuelve el estado, equipo, fechas, importes y datos operativos del cliente.')]
#[IsReadOnly]
#[IsIdempotent]
#[IsOpenWorld(false)]
class ConsultarReparacionTool extends Tool
{
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'identificador' => ['required', 'string', 'max:100'],
        ], [
            'identificador.required' => 'Indica el codigo de reparacion o el ID numerico.',
        ]);

        $identificador = trim($validated['identificador']);

        $reparacion = Reparacion::query()
            ->with([
                'cliente:id,nombre',
                'modulo:id,nombre',
            ])
            ->where('codigo_reparacion', $identificador)
            ->when(ctype_digit($identificador), function ($query) use ($identificador): void {
                $query->orWhereKey((int) $identificador);
            })
            ->first();

        if (! $reparacion) {
            return Response::error("No se encontro una reparacion con el identificador [{$identificador}]. Verifica el codigo o ID.");
        }

        return Response::json([
            'id' => $reparacion->id,
            'codigo_reparacion' => $reparacion->codigo_reparacion,
            'estado' => $reparacion->estado_reparacion,
            'equipo' => [
                'tipo' => $reparacion->tipo_equipo,
                'marca' => $reparacion->marca,
                'modelo' => $reparacion->modelo,
                'problema_reportado' => $reparacion->problema_reportado,
                'diagnostico' => $reparacion->diagnostico,
            ],
            'cliente' => $reparacion->cliente ? [
                'nombre' => $reparacion->cliente->nombre,
            ] : null,
            'modulo' => $reparacion->modulo?->nombre,
            'importes' => [
                'costo_reparacion' => (float) $reparacion->costo_reparacion,
                'anticipo' => (float) $reparacion->anticipo,
                'saldo_pendiente' => (float) $reparacion->saldo_pendiente,
            ],
            'fechas' => [
                'ingreso' => $reparacion->fecha_ingreso?->toIso8601String(),
                'entrega_estimada' => $reparacion->fecha_estimada_entrega?->toDateString(),
                'entrega' => $reparacion->fecha_entrega?->toIso8601String(),
            ],
            'observacion' => $reparacion->observacion,
        ]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'identificador' => $schema->string()
                ->description('Codigo exacto de reparacion, por ejemplo REP-0001, o ID numerico.')
                ->required(),
        ];
    }
}
