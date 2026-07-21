<?php

namespace App\Services\Comprobantes;

use App\Models\Comprobante;
use App\Models\CostoOperativo;
use App\Models\MovimientoCaja;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class ComprobanteService
{
    public function storeFor(
        ?CostoOperativo $costo,
        ?MovimientoCaja $movimiento,
        array $data,
        ?int $userId = null,
    ): void {
        /** @var array<int, UploadedFile> $files */
        $files = $data['comprobantes'] ?? [];

        foreach ($files as $file) {
            $path = $file->store('comprobantes/'.now()->format('Y/m'), 'local');

            if (! $path) {
                throw new RuntimeException('No se pudo almacenar el comprobante.');
            }

            try {
                Comprobante::query()->create([
                    'costo_operativo_id' => $costo?->id,
                    'movimiento_caja_id' => $movimiento?->id,
                    'subido_por' => $userId,
                    'tipo_documento' => $data['tipo_comprobante'] ?? 'otro',
                    'proveedor' => $data['proveedor_comprobante'] ?? null,
                    'fecha_documento' => filled($data['fecha_documento'] ?? null) ? Carbon::parse($data['fecha_documento'])->toDateString() : null,
                    'periodo_desde' => $data['periodo_desde'] ?? null,
                    'periodo_hasta' => $data['periodo_hasta'] ?? null,
                    'dias_cobrados' => $data['dias_cobrados'] ?? null,
                    'tarifa_diaria' => $data['tarifa_diaria'] ?? null,
                    'nombre_original' => $file->getClientOriginalName(),
                    'ruta' => $path,
                    'mime_type' => $file->getMimeType() ?: $file->getClientMimeType(),
                    'tamano' => $file->getSize(),
                ]);
            } catch (Throwable $exception) {
                Storage::disk('local')->delete($path);
                throw $exception;
            }
        }
    }
}
