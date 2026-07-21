<?php

namespace App\Http\Controllers\Api\Caja;

use App\Http\Controllers\Controller;
use App\Http\Requests\Caja\CajaReportHistoryRequest;
use App\Http\Requests\Caja\MonthlyCajaReportRequest;
use App\Http\Resources\Ventas\ReporteFinancieroResource;
use App\Services\Caja\CajaReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CajaReportController extends Controller
{
    public function __construct(private readonly CajaReportService $service)
    {
    }

    public function monthly(MonthlyCajaReportRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->service->monthly($request->validated())]);
    }

    public function close(MonthlyCajaReportRequest $request): ReporteFinancieroResource
    {
        return new ReporteFinancieroResource(
            $this->service->closeMonth($request->validated(), $request->user())
        );
    }

    public function history(CajaReportHistoryRequest $request): AnonymousResourceCollection
    {
        return ReporteFinancieroResource::collection(
            $this->service->history($request->validated())
        );
    }
}
