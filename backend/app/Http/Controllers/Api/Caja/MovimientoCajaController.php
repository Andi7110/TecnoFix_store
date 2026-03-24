<?php

namespace App\Http\Controllers\Api\Caja;

use App\Actions\Caja\RegistrarMovimientoCajaAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Caja\IndexMovimientoCajaRequest;
use App\Http\Requests\Caja\StoreMovimientoCajaRequest;
use App\Http\Resources\Caja\MovimientoCajaResource;
use App\Models\MovimientoCaja;
use App\Services\Caja\MovimientoCajaService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MovimientoCajaController extends Controller
{
    public function __construct(
        private readonly MovimientoCajaService $movimientoCajaService,
        private readonly RegistrarMovimientoCajaAction $registrarMovimientoCaja,
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
        return new MovimientoCajaResource(
            $this->movimientoCajaService->loadRelations(
                $this->registrarMovimientoCaja->execute($request->validated())
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
