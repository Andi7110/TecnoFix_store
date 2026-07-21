<?php

namespace App\Http\Resources\Caja;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComprobanteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tipo_documento' => $this->tipo_documento,
            'proveedor' => $this->proveedor,
            'fecha_documento' => $this->fecha_documento?->toDateString(),
            'periodo_desde' => $this->periodo_desde?->toDateString(),
            'periodo_hasta' => $this->periodo_hasta?->toDateString(),
            'dias_cobrados' => $this->dias_cobrados,
            'tarifa_diaria' => $this->tarifa_diaria,
            'nombre_original' => $this->nombre_original,
            'mime_type' => $this->mime_type,
            'tamano' => $this->tamano,
            'archivo_url' => route('caja.comprobantes.archivo', ['comprobante' => $this->id]),
            'origen' => $this->costo_operativo_id ? 'costos' : 'caja',
            'costo' => $this->whenLoaded('costoOperativo', fn (): ?array => $this->costoOperativo ? [
                'id' => $this->costoOperativo->id,
                'concepto' => $this->costoOperativo->concepto,
                'categoria' => $this->costoOperativo->categoria,
                'monto' => $this->costoOperativo->monto,
            ] : null),
            'movimiento' => $this->whenLoaded('movimientoCaja', fn (): ?array => $this->movimientoCaja ? [
                'id' => $this->movimientoCaja->id,
                'concepto' => $this->movimientoCaja->concepto,
                'categoria' => $this->movimientoCaja->categoria_movimiento,
                'monto' => $this->movimientoCaja->monto,
                'fecha' => $this->movimientoCaja->fecha_movimiento,
            ] : null),
            'subido_por_usuario' => $this->whenLoaded('subidoPor', fn (): ?array => $this->subidoPor ? [
                'id' => $this->subidoPor->id,
                'name' => $this->subidoPor->name,
            ] : null),
            'created_at' => $this->created_at,
        ];
    }
}
