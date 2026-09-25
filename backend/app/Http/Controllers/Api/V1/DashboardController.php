<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\DashboardService;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get Dashboard Summary (KPIs)
     */
    public function summary(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $summary = $this->dashboardService->getSummary($householdId, $userId);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard summary retrieved',
            'data' => $summary
        ]);
    }

    /**
     * Get Cashflow Chart Data
     */
    public function cashflow(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $months = $request->get('months', 6);
        
        $data = $this->dashboardService->getCashflow($householdId, $userId, $months);

        return response()->json([
            'success' => true,
            'message' => 'Cashflow data retrieved',
            'data' => $data
        ]);
    }
    
    /**
     * Placeholders for Net Worth, Assets, Categories...
     */
    public function netWorth(Request $request)
    {
        return response()->json(['success' => true, 'data' => []]);
    }
    
    public function assets(Request $request)
    {
        return response()->json(['success' => true, 'data' => []]);
    }
    
    public function categories(Request $request)
    {
        return response()->json(['success' => true, 'data' => []]);
    }
}
