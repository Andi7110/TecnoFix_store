<?php

namespace App\Mcp\Servers;

use App\Mcp\Prompts\AnalizarReparacionPrompt;
use App\Mcp\Resources\GuiaOperativaResource;
use App\Mcp\Tools\BuscarProductosTool;
use App\Mcp\Tools\ConsultarReparacionTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;
use Laravel\Mcp\Server\Prompt;
use Laravel\Mcp\Server\Tool;

#[Name('TecnoFix Server')]
#[Version('1.0.0')]
#[Instructions('Servidor de solo lectura para consultar reparaciones e inventario de TecnoFix. Usa las herramientas antes de responder sobre datos del negocio y no inventes registros, estados, saldos ni existencias.')]
class TecnoFixServer extends Server
{
    /** @var array<int, class-string<Tool>> */
    protected array $tools = [
        ConsultarReparacionTool::class,
        BuscarProductosTool::class,
    ];

    /** @var array<int, class-string<Server\Resource>> */
    protected array $resources = [
        GuiaOperativaResource::class,
    ];

    /** @var array<int, class-string<Prompt>> */
    protected array $prompts = [
        AnalizarReparacionPrompt::class,
    ];
}
