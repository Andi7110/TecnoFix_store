<?php

namespace Tests\Feature\Mcp;

use App\Mcp\Prompts\AnalizarReparacionPrompt;
use App\Mcp\Resources\GuiaOperativaResource;
use App\Mcp\Servers\TecnoFixServer;
use App\Mcp\Tools\BuscarProductosTool;
use App\Mcp\Tools\ConsultarReparacionTool;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TecnoFixServerTest extends TestCase
{
    use RefreshDatabase;

    private int $clienteId;

    private int $moduloId;

    private int $categoriaId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->clienteId = DB::table('clientes')->insertGetId([
            'nombre' => 'Cliente de prueba',
            'telefono' => '7000-0000',
        ]);

        $this->moduloId = DB::table('modulos')->insertGetId([
            'nombre' => 'Taller principal',
        ]);

        $this->categoriaId = DB::table('categorias')->insertGetId([
            'modulo_id' => $this->moduloId,
            'nombre' => 'Repuestos',
        ]);
    }

    public function test_expone_la_guia_y_el_prompt_operativo(): void
    {
        TecnoFixServer::resource(GuiaOperativaResource::class)
            ->assertOk()
            ->assertSee('Guia operativa de TecnoFix');

        TecnoFixServer::prompt(AnalizarReparacionPrompt::class, [
            'identificador' => 'REP-PRUEBA',
        ])->assertOk()->assertSee('REP-PRUEBA');
    }

    public function test_consulta_una_reparacion_por_codigo(): void
    {
        DB::table('reparaciones')->insert([
            'cliente_id' => $this->clienteId,
            'modulo_id' => $this->moduloId,
            'codigo_reparacion' => 'REP-0001',
            'marca' => 'Dell',
            'modelo' => 'Latitude',
            'tipo_equipo' => 'otro',
            'problema_reportado' => 'No enciende',
            'diagnostico' => 'Cargador danado',
            'costo_reparacion' => 50,
            'anticipo' => 20,
            'saldo_pendiente' => 30,
            'fecha_ingreso' => '2026-07-14 08:00:00',
            'fecha_estimada_entrega' => '2026-07-16',
            'estado_reparacion' => 'en_proceso',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        TecnoFixServer::tool(ConsultarReparacionTool::class, [
            'identificador' => 'REP-0001',
        ])->assertOk()->assertSee([
            'REP-0001',
            'en_proceso',
            'Cliente de prueba',
            'saldo_pendiente',
        ]);
    }

    public function test_busca_productos_con_stock_bajo(): void
    {
        DB::table('productos')->insert([
            [
                'categoria_id' => $this->categoriaId,
                'modulo_id' => $this->moduloId,
                'codigo' => 'BAT-001',
                'nombre' => 'Bateria de laptop',
                'precio_venta' => 45,
                'stock' => 2,
                'stock_minimo' => 3,
                'unidad_medida' => 'unidad',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'categoria_id' => $this->categoriaId,
                'modulo_id' => $this->moduloId,
                'codigo' => 'CAR-001',
                'nombre' => 'Cargador de laptop',
                'precio_venta' => 25,
                'stock' => 10,
                'stock_minimo' => 3,
                'unidad_medida' => 'unidad',
                'estado' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        TecnoFixServer::tool(BuscarProductosTool::class, [
            'solo_stock_bajo' => true,
        ])->assertOk()
            ->assertSee(['BAT-001', 'stock_bajo'])
            ->assertDontSee('CAR-001');
    }
}
