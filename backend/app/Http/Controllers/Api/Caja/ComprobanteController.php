<?php

namespace App\Http\Controllers\Api\Caja;

use App\Http\Controllers\Controller;
use App\Http\Requests\Caja\IndexComprobanteRequest;
use App\Http\Resources\Caja\ComprobanteResource;
use App\Models\Comprobante;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ComprobanteController extends Controller
{
    public function index(IndexComprobanteRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $perPage = min(max((int) ($filters['per_page'] ?? 12), 1), 100);

        $query = Comprobante::query()
            ->with([
                'costoOperativo:id,concepto,categoria,monto',
                'movimientoCaja:id,concepto,categoria_movimiento,monto,fecha_movimiento',
                'subidoPor:id,name',
            ])
            ->when(filled($filters['tipo_documento'] ?? null), fn ($query) => $query->where('tipo_documento', $filters['tipo_documento']))
            ->when(($filters['origen'] ?? null) === 'costos', fn ($query) => $query->whereNotNull('costo_operativo_id'))
            ->when(($filters['origen'] ?? null) === 'caja', fn ($query) => $query->whereNull('costo_operativo_id')->whereNotNull('movimiento_caja_id'))
            ->when(filled($filters['fecha_desde'] ?? null), fn ($query) => $query->whereDate('fecha_documento', '>=', $filters['fecha_desde']))
            ->when(filled($filters['fecha_hasta'] ?? null), fn ($query) => $query->whereDate('fecha_documento', '<=', $filters['fecha_hasta']))
            ->when(filled($filters['buscar'] ?? null), function ($query) use ($filters): void {
                $term = $filters['buscar'];
                $query->where(function ($query) use ($term): void {
                    $query->where('proveedor', 'like', "%{$term}%")
                        ->orWhere('nombre_original', 'like', "%{$term}%")
                        ->orWhereHas('costoOperativo', fn ($query) => $query->where('concepto', 'like', "%{$term}%"))
                        ->orWhereHas('movimientoCaja', fn ($query) => $query->where('concepto', 'like', "%{$term}%"));
                });
            });

        return ComprobanteResource::collection(
            $query->orderByDesc('fecha_documento')->orderByDesc('id')->paginate($perPage)->withQueryString()
        );
    }

    public function archivo(Comprobante $comprobante): BinaryFileResponse
    {
        abort_unless(Storage::disk('local')->exists($comprobante->ruta), 404, 'El archivo no existe.');

        return response()->file(Storage::disk('local')->path($comprobante->ruta), [
            'Content-Type' => $comprobante->mime_type,
            'Content-Disposition' => 'inline; filename="'.str_replace('"', '', $comprobante->nombre_original).'"',
        ]);
    }
}
