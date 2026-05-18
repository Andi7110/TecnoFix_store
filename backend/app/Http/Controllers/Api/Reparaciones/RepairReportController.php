<?php

namespace App\Http\Controllers\Api\Reparaciones;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reparaciones\DailyRepairReportRequest;
use App\Http\Requests\Reparaciones\MonthlyRepairReportRequest;
use App\Http\Requests\Reparaciones\RepairReportHistoryRequest;
use App\Http\Resources\Ventas\ReporteFinancieroResource;
use App\Services\Reparaciones\RepairReportService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class RepairReportController extends Controller
{
    public function __construct(
        private readonly RepairReportService $repairReportService,
    ) {
    }

    public function daily(DailyRepairReportRequest $request): JsonResource
    {
        return JsonResource::make(
            $this->repairReportService->getDailyReport($request->validated())
        );
    }

    public function monthly(MonthlyRepairReportRequest $request): JsonResource
    {
        return JsonResource::make(
            $this->repairReportService->getMonthlyReport($request->validated())
        );
    }

    public function storeDaily(DailyRepairReportRequest $request): ReporteFinancieroResource
    {
        return new ReporteFinancieroResource(
            $this->repairReportService->storeDailyReport($request->validated(), $request->user())
        );
    }

    public function storeMonthly(MonthlyRepairReportRequest $request): ReporteFinancieroResource
    {
        return new ReporteFinancieroResource(
            $this->repairReportService->storeMonthlyReport($request->validated(), $request->user())
        );
    }

    public function history(RepairReportHistoryRequest $request): AnonymousResourceCollection
    {
        return ReporteFinancieroResource::collection(
            $this->repairReportService->getHistory($request->validated())
        );
    }
}
