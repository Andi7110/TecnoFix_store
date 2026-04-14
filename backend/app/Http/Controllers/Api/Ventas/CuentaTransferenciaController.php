<?php

namespace App\Http\Controllers\Api\Ventas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ventas\StoreCuentaTransferenciaRequest;
use App\Http\Requests\Ventas\UpdateCuentaTransferenciaRequest;
use App\Http\Resources\Ventas\CuentaTransferenciaResource;
use App\Models\CuentaTransferencia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CuentaTransferenciaController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CuentaTransferenciaResource::collection(
            CuentaTransferencia::query()
                ->orderByDesc('is_active')
                ->orderByDesc('updated_at')
                ->orderByDesc('id')
                ->get()
        );
    }

    public function store(StoreCuentaTransferenciaRequest $request): CuentaTransferenciaResource
    {
        $cuenta = CuentaTransferencia::query()->create([
            'bank_name' => $request->validated('bank_name'),
            'account_number' => $request->validated('account_number'),
            'owner_name' => $request->validated('owner_name'),
            'owner_type' => $request->validated('owner_type', 'Natural'),
            'is_active' => $request->validated('is_active', true),
        ]);

        return new CuentaTransferenciaResource($cuenta);
    }

    public function update(
        UpdateCuentaTransferenciaRequest $request,
        CuentaTransferencia $cuentaTransferencia,
    ): CuentaTransferenciaResource {
        $cuentaTransferencia->update($request->validated());

        return new CuentaTransferenciaResource($cuentaTransferencia->fresh());
    }

    public function destroy(CuentaTransferencia $cuentaTransferencia): JsonResponse
    {
        $cuentaTransferencia->delete();

        return response()->json([
            'message' => 'Cuenta eliminada correctamente.',
        ]);
    }
}
