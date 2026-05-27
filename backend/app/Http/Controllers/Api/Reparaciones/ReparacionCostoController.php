<?php

namespace App\Http\Controllers\Api\Reparaciones;

use App\Actions\Reparaciones\RegistrarCostoReparacionAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reparaciones\StoreCostoReparacionRequest;
use App\Http\Resources\Reparaciones\CostoReparacionResource;
use App\Models\CostoReparacion;
use App\Models\Reparacion;
use Illuminate\Support\Facades\DB;

class ReparacionCostoController extends Controller
{
    public function __construct(
        private readonly RegistrarCostoReparacionAction $registrarCostoReparacion,
    ) {
    }

    public function store(StoreCostoReparacionRequest $request, Reparacion $reparacione): CostoReparacionResource
    {
        return new CostoReparacionResource(
            DB::transaction(fn () => $this->registrarCostoReparacion->execute($reparacione, $request->validated()))
        );
    }

    public function update(StoreCostoReparacionRequest $request, Reparacion $reparacione, CostoReparacion $costo): CostoReparacionResource
    {
        abort_unless((int) $costo->reparacion_id === (int) $reparacione->id, 404);

        return new CostoReparacionResource(
            DB::transaction(fn () => $this->registrarCostoReparacion->update($costo, $request->validated()))
        );
    }
}
