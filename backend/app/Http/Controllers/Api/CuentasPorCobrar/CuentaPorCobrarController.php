<?php

namespace App\Http\Controllers\Api\CuentasPorCobrar;

use App\Http\Controllers\Controller;
use App\Http\Requests\CuentasPorCobrar\IndexCuentaPorCobrarRequest;
use App\Http\Requests\CuentasPorCobrar\StoreAbonoCuentaPorCobrarRequest;
use App\Http\Resources\CuentasPorCobrar\CuentaPorCobrarResource;
use App\Models\CuentaPorCobrar;
use App\Services\CuentasPorCobrar\CuentaPorCobrarService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CuentaPorCobrarController extends Controller
{
    public function __construct(
        private readonly CuentaPorCobrarService $cuentaService,
    ) {
    }

    public function index(IndexCuentaPorCobrarRequest $request): AnonymousResourceCollection
    {
        $result = $this->cuentaService->paginate($request->validated());

        return CuentaPorCobrarResource::collection($result['cuentas'])
            ->additional(['summary' => $result['summary']]);
    }

    public function show(CuentaPorCobrar $cuentaPorCobrar): CuentaPorCobrarResource
    {
        return new CuentaPorCobrarResource(
            $this->cuentaService->loadRelations($cuentaPorCobrar)
        );
    }

    public function abonar(StoreAbonoCuentaPorCobrarRequest $request, CuentaPorCobrar $cuentaPorCobrar): CuentaPorCobrarResource
    {
        return new CuentaPorCobrarResource(
            $this->cuentaService->abonar($cuentaPorCobrar, $request->validated())
        );
    }
}
