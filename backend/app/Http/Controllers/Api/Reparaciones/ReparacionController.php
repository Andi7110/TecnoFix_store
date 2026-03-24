<?php

namespace App\Http\Controllers\Api\Reparaciones;

use App\Actions\Reparaciones\RegistrarReparacionAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reparaciones\IndexReparacionRequest;
use App\Http\Requests\Reparaciones\StoreReparacionRequest;
use App\Http\Requests\Reparaciones\UpdateEstadoReparacionRequest;
use App\Http\Requests\Reparaciones\UpdateReparacionRequest;
use App\Http\Resources\Reparaciones\ReparacionResource;
use App\Models\Reparacion;
use App\Services\Reparaciones\ReparacionService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReparacionController extends Controller
{
    public function __construct(
        private readonly ReparacionService $reparacionService,
        private readonly RegistrarReparacionAction $registrarReparacion,
    ) {
    }

    public function index(IndexReparacionRequest $request): AnonymousResourceCollection
    {
        return ReparacionResource::collection(
            $this->reparacionService->paginate($request->validated())
        );
    }

    public function store(StoreReparacionRequest $request): ReparacionResource
    {
        return new ReparacionResource(
            $this->registrarReparacion->execute($request->validated())
        );
    }

    public function show(Reparacion $reparacione): ReparacionResource
    {
        return new ReparacionResource(
            $this->reparacionService->loadRelations($reparacione)
        );
    }

    public function update(UpdateReparacionRequest $request, Reparacion $reparacione): ReparacionResource
    {
        return new ReparacionResource(
            $this->reparacionService->update($reparacione, $request->validated())
        );
    }

    public function updateEstado(UpdateEstadoReparacionRequest $request, Reparacion $reparacione): ReparacionResource
    {
        return new ReparacionResource(
            $this->reparacionService->changeStatus($reparacione, $request->validated())
        );
    }
}
