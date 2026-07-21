<?php

namespace App\Http\Controllers\Api\Caja;

use App\Actions\Caja\RegistrarMovimientoCajaAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Caja\IndexMovimientoCajaRequest;
use App\Http\Requests\Caja\StoreMovimientoCajaRequest;
use App\Http\Resources\Caja\MovimientoCajaResource;
use App\Models\MovimientoCaja;
use App\Services\Caja\MovimientoCajaService;
use App\Services\Comprobantes\ComprobanteService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;

class MovimientoCajaController extends Controller
{
    public function __construct(
        private readonly MovimientoCajaService $movimientoCajaService,
        private readonly RegistrarMovimientoCajaAction $registrarMovimientoCaja,
        private readonly ComprobanteService $comprobanteService,
    ) {
    }

    public function index(IndexMovimientoCajaRequest $request): AnonymousResourceCollection
    {
        $result = $this->movimientoCajaService->paginate($request->validated());

        return MovimientoCajaResource::collection($result['movimientos'])
            ->additional([
                'summary' => $result['summary'],
            ]);
    }

    public function store(StoreMovimientoCajaRequest $request): MovimientoCajaResource
    {
        $data = $request->validated();
        $attachmentKeys = [
            'comprobantes', 'tipo_comprobante', 'proveedor_comprobante', 'fecha_documento',
            'periodo_desde', 'periodo_hasta', 'dias_cobrados', 'tarifa_diaria',
        ];
        $movimiento = $this->registrarMovimientoCaja->execute(Arr::except($data, $attachmentKeys));
        $this->comprobanteService->storeFor(
            null,
            $movimiento,
            [
                ...Arr::only($data, $attachmentKeys),
                'fecha_documento' => $data['fecha_documento'] ?? $data['fecha_movimiento'],
            ],
            $request->user()?->id,
        );

        return new MovimientoCajaResource(
            $this->movimientoCajaService->loadRelations(
                $movimiento
            )
        );
    }

    public function show(MovimientoCaja $movimiento): MovimientoCajaResource
    {
        return new MovimientoCajaResource(
            $this->movimientoCajaService->loadRelations($movimiento)
        );
    }
}
