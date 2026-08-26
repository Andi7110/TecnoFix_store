<?php

namespace App\Mcp\Tools;

use App\Models\Producto;
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

#[Name('buscar-productos')]
#[Description('Busca productos activos del inventario de TecnoFix por nombre o codigo y permite limitar el resultado a productos con stock bajo.')]
#[IsReadOnly]
#[IsIdempotent]
#[IsOpenWorld(false)]
class BuscarProductosTool extends Tool
{
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'termino' => ['nullable', 'string', 'max:100'],
            'solo_stock_bajo' => ['nullable', 'boolean'],
            'limite' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $termino = trim((string) ($validated['termino'] ?? ''));
        $soloStockBajo = (bool) ($validated['solo_stock_bajo'] ?? false);
        $limite = (int) ($validated['limite'] ?? 20);

        $productos = Producto::query()
            ->activos()
            ->with([
                'categoria:id,nombre',
                'modulo:id,nombre',
            ])
            ->buscar($termino)
            ->stockBajo($soloStockBajo)
            ->orderByRaw('CASE WHEN stock <= stock_minimo THEN 0 ELSE 1 END')
            ->orderBy('nombre')
            ->limit($limite)
            ->get();

        return Response::json([
            'filtros' => [
                'termino' => $termino !== '' ? $termino : null,
                'solo_stock_bajo' => $soloStockBajo,
                'limite' => $limite,
            ],
            'total_resultados' => $productos->count(),
            'productos' => $productos->map(fn (Producto $producto): array => [
                'id' => $producto->id,
                'codigo' => $producto->codigo,
                'nombre' => $producto->nombre,
                'categoria' => $producto->categoria?->nombre,
                'modulo' => $producto->modulo?->nombre,
                'precio_venta' => (float) $producto->precio_venta,
                'stock' => $producto->stock,
                'stock_minimo' => $producto->stock_minimo,
                'stock_bajo' => $producto->stock <= $producto->stock_minimo,
                'unidad_medida' => $producto->unidad_medida,
            ])->values()->all(),
        ]);
    }

    /** @return array<string, Type> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'termino' => $schema->string()
                ->description('Texto parcial del nombre o codigo. Puede omitirse para listar productos.'),
            'solo_stock_bajo' => $schema->boolean()
                ->description('Si es verdadero, devuelve unicamente productos cuyo stock es menor o igual al minimo.')
                ->default(false),
            'limite' => $schema->integer()
                ->description('Cantidad maxima de resultados, entre 1 y 50.')
                ->default(20),
        ];
    }
}
