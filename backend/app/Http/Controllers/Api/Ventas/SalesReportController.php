<?php

namespace App\Http\Controllers\Api\Ventas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ventas\DailySalesReportRequest;
use App\Http\Requests\Ventas\MonthlyIncomeStatementRequest;
use App\Http\Requests\Ventas\SalesReportHistoryRequest;
use App\Http\Resources\Ventas\DailySalesReportResource;
use App\Http\Resources\Ventas\MonthlyIncomeStatementResource;
use App\Http\Resources\Ventas\ReporteFinancieroResource;
use App\Services\Ventas\SalesReportService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SalesReportController extends Controller
{
    public function __construct(
        private readonly SalesReportService $salesReportService,
    ) {
    }

    public function daily(DailySalesReportRequest $request): DailySalesReportResource
    {
        return new DailySalesReportResource(
            $this->salesReportService->getDailyReport($request->validated())
        );
    }

    public function monthlyIncomeStatement(MonthlyIncomeStatementRequest $request): MonthlyIncomeStatementResource
    {
        return new MonthlyIncomeStatementResource(
            $this->salesReportService->getMonthlyIncomeStatement($request->validated())
        );
    }

    public function storeDaily(DailySalesReportRequest $request): ReporteFinancieroResource
    {
        return new ReporteFinancieroResource(
            $this->salesReportService->storeDailyReport($request->validated(), $request->user())
        );
    }

    public function storeMonthly(MonthlyIncomeStatementRequest $request): ReporteFinancieroResource
    {
        return new ReporteFinancieroResource(
            $this->salesReportService->storeMonthlyIncomeStatement($request->validated(), $request->user())
        );
    }

    public function history(SalesReportHistoryRequest $request): AnonymousResourceCollection
    {
        return ReporteFinancieroResource::collection(
            $this->salesReportService->getHistory($request->validated())
        );
    }
}
