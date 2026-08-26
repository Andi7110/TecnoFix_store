<?php

namespace App\Mcp\Resources;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\MimeType;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Uri;
use Laravel\Mcp\Server\Resource;

#[Name('guia-operativa-tecnofix')]
#[Description('Reglas para interpretar correctamente reparaciones, saldos e inventario en TecnoFix.')]
#[Uri('tecnofix://recursos/guia-operativa')]
#[MimeType('text/markdown')]
class GuiaOperativaResource extends Resource
{
    public function handle(Request $request): Response
    {
        return Response::text(<<<'MARKDOWN'
            # Guia operativa de TecnoFix

            ## Reparaciones

            - `registrado`: el equipo fue recibido y aun no se encuentra en reparacion activa.
            - `en_proceso`: el trabajo tecnico esta en curso.
            - `terminado`: el trabajo finalizo, pero el equipo aun no se ha entregado.
            - `entregado`: el equipo fue entregado mediante el flujo de entrega y cobro.
            - `cancelado`: la reparacion fue cancelada.
            - Un saldo mayor que cero indica dinero pendiente de cobro; no implica por si solo que el trabajo este pendiente.

            ## Inventario

            - Un producto tiene stock bajo cuando `stock` es menor o igual que `stock_minimo`.
            - Las herramientas MCP solo muestran productos activos.
            - No prometas disponibilidad si la herramienta no devuelve el producto solicitado.

            ## Reglas para respuestas

            - Usa las herramientas para datos actuales y no inventes codigos, estados, fechas, precios o existencias.
            - Distingue siempre el estado tecnico de una reparacion de su saldo financiero.
            - No reveles informacion distinta de la devuelta por las herramientas.
            - Estas capacidades son de solo lectura: no confirmes que se modifico ningun registro.
            MARKDOWN);
    }
}
