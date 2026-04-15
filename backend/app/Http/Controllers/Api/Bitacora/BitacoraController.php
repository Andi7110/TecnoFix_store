<?php

namespace App\Http\Controllers\Api\Bitacora;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bitacora\IndexBitacoraRequest;
use App\Http\Resources\Bitacora\BitacoraResource;
use App\Models\Bitacora;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BitacoraController extends Controller
{
    public function index(IndexBitacoraRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 15);

        $query = Bitacora::query()
            ->with('usuario')
            ->porModulo($filters['modulo'] ?? null)
            ->porAccion($filters['accion'] ?? null)
            ->buscar($filters['buscar'] ?? null)
            ->when($filters['user_id'] ?? null, fn ($query, $userId) => $query->where('user_id', $userId))
            ->when($filters['fecha_desde'] ?? null, fn ($query, $date) => $query->whereDate('fecha_movimiento', '>=', $date))
            ->when($filters['fecha_hasta'] ?? null, fn ($query, $date) => $query->whereDate('fecha_movimiento', '<=', $date))
            ->latest('fecha_movimiento')
            ->latest('id');

        return BitacoraResource::collection($query->paginate($perPage));
    }

    public function show(Bitacora $bitacora): BitacoraResource
    {
        return new BitacoraResource($bitacora->load('usuario'));
    }
}
