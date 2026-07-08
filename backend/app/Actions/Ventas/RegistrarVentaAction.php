<?php

namespace App\Actions\Ventas;

use App\Actions\Reparaciones\UpsertClienteAction;
use App\Models\CuentaPorCobrar;
use App\Actions\Inventario\RegistrarMovimientoInventarioAction;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RegistrarVentaAction
{
    public function __construct(
        private readonly CalcularTotalesVentaAction $calcularTotalesVenta,
        private readonly RegistrarMovimientoInventarioAction $registrarMovimientoInventario,
        private readonly RegistrarMovimientoCajaVentaAction $registrarMovimientoCajaVenta,
        private readonly UpsertClienteAction $upsertCliente,
    ) {
    }

    public function execute(array $data): Venta
    {
        return DB::transaction(function () use ($data): Venta {
            $productoIds = collect($data['items'])
                ->pluck('producto_id')
                ->filter()
                ->unique()
                ->values();

            $productos = Producto::query()
                ->select(['id', 'modulo_id', 'nombre', 'precio_compra', 'stock', 'estado'])
                ->whereIn('id', $productoIds)
                ->lockForUpdate()
                ->get();

            $ventaCalculada = $this->calcularTotalesVenta->execute($data, $productos);
            $numeroVenta = $this->generateNumeroVenta();

            $venta = Venta::query()->create([
                'modulo_id' => $data['modulo_id'],
                'numero_venta' => $numeroVenta,
                'fecha_venta' => $data['fecha_venta'],
                'subtotal' => $ventaCalculada['subtotal'],
                'descuento' => $ventaCalculada['descuento'],
                'total' => $ventaCalculada['total'],
                'metodo_pago' => $data['metodo_pago'],
                'observacion' => $data['observacion'] ?? null,
            ]);

            foreach ($ventaCalculada['items'] as $item) {
                DetalleVenta::query()->create([
                    'venta_id' => $venta->id,
                    'producto_id' => $item['producto_id'],
                    'descripcion_item' => $item['descripcion_item'],
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $item['precio_unitario'],
                    'costo_unitario' => $item['costo_unitario'],
                    'subtotal' => $item['subtotal'],
                    'ganancia_item' => $item['ganancia_item'],
                ]);

                if (! $item['producto']) {
                    continue;
                }

                $this->registrarMovimientoInventario->execute($item['producto'], [
                    'tipo_movimiento' => 'salida',
                    'cantidad' => $item['cantidad'],
                    'motivo' => 'venta',
                    'referencia' => $numeroVenta,
                    'fecha_movimiento' => $data['fecha_venta'],
                    'observacion' => 'Salida generada por la venta '.$numeroVenta.'.',
                ]);
            }

            $montoPagado = $data['monto_pagado'] ?? null;

            $this->registrarMovimientoCajaVenta->execute($venta, $montoPagado);
            $this->registrarCuentaPorCobrar($venta, $data, (float) ($montoPagado ?? $venta->total));

            return $venta->load([
                'modulo:id,nombre,estado',
                'detalles.producto:id,codigo,nombre,unidad_medida',
            ]);
        });
    }

    private function generateNumeroVenta(): string
    {
        return 'VTA-'.now()->format('Ymd-His').'-'.Str::upper(Str::random(4));
    }

    private function registrarCuentaPorCobrar(Venta $venta, array $data, float $montoPagado): void
    {
        $saldoPendiente = round((float) $venta->total - min($montoPagado, (float) $venta->total), 2);
        $payload = $data['cuenta_por_cobrar'] ?? null;

        if ($saldoPendiente <= 0 || ! is_array($payload)) {
            return;
        }

        $cliente = $this->upsertCliente->execute([
            'nombre' => $payload['cliente_nombre'] ?? 'Cliente pendiente',
            'telefono' => $payload['cliente_telefono'] ?? null,
        ]);

        CuentaPorCobrar::query()->create([
            'venta_id' => $venta->id,
            'cliente_id' => $cliente->id,
            'modulo_id' => $venta->modulo_id,
            'codigo' => 'CXC-'.$venta->numero_venta,
            'cliente_nombre' => $cliente->nombre,
            'cliente_telefono' => $cliente->telefono,
            'monto_original' => $venta->total,
            'monto_pagado' => min($montoPagado, (float) $venta->total),
            'saldo_pendiente' => $saldoPendiente,
            'fecha_cuenta' => $venta->fecha_venta,
            'fecha_promesa_pago' => $payload['fecha_promesa_pago'] ?? null,
            'estado' => 'pendiente',
            'motivo' => $payload['motivo'] ?? null,
            'observacion' => $data['observacion'] ?? null,
        ]);
    }
}
