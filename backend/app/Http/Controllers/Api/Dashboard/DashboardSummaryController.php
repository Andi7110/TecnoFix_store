<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\Dashboard\DashboardSummaryResource;
use App\Services\Dashboard\DashboardSummaryService;

class DashboardSummaryController extends Controller
{
    public function __construct(
        private readonly DashboardSummaryService $dashboardSummaryService,
    ) {
    }

    public function __invoke(): DashboardSummaryResource
    {
        return new DashboardSummaryResource(
            $this->dashboardSummaryService->getSummary()
        );
    }
}
