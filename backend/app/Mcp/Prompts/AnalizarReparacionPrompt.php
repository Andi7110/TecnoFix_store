<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Prompts\Argument;

#[Name('analizar-reparacion')]
#[Description('Prepara una consulta guiada para revisar el estado operativo y financiero de una reparacion de TecnoFix.')]
class AnalizarReparacionPrompt extends Prompt
{
    /** @return array<int, Argument> */
    public function arguments(): array
    {
        return [
            new Argument(
                name: 'identificador',
                description: 'Codigo exacto o ID numerico de la reparacion.',
                required: true,
            ),
        ];
    }

    /** @return array<int, Response> */
    public function handle(Request $request): array
    {
        $validated = $request->validate([
            'identificador' => ['required', 'string', 'max:100'],
        ]);

        return [
            Response::text('Actua como asistente operativo de TecnoFix. Consulta primero los datos reales con la herramienta consultar-reparacion. Explica por separado el estado tecnico, las fechas y el saldo. Si el registro no existe, indicalo claramente y no inventes informacion.')->asAssistant(),
            Response::text("Analiza la reparacion {$validated['identificador']} y dame un resumen breve con las acciones de seguimiento recomendadas."),
        ];
    }
}
