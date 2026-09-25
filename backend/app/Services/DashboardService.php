<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Get key performance indicators (KPIs) for the dashboard.
     */
    public function getSummary($householdId, $userId)
    {
        $allowedAccountIds = $this->getAllowedAccounts($householdId, $userId);

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        
        // 1. Total Balance & Net Worth
        $totalBalance = Account::whereIn('id', $allowedAccountIds)
            ->where('is_active', true)
            ->sum('initial_balance'); // For MVP, we use initial_balance. In full version, this requires summing up transactions.

        // Real balance calculation based on transactions
        $incomeSum = Transaction::whereIn('account_id', $allowedAccountIds)
            ->where('type', 'income')
            ->sum('amount');
            
        $expenseSum = Transaction::whereIn('account_id', $allowedAccountIds)
            ->where('type', 'expense')
            ->sum('amount');
            
        $totalBalance = $totalBalance + $incomeSum - $expenseSum;

        // 2. Monthly Income & Expense
        $monthlyIncome = Transaction::whereIn('account_id', $allowedAccountIds)
            ->where('type', 'income')
            ->where('transaction_date', '>=', $startOfMonth)
            ->sum('amount');

        $monthlyExpense = Transaction::whereIn('account_id', $allowedAccountIds)
            ->where('type', 'expense')
            ->where('transaction_date', '>=', $startOfMonth)
            ->sum('amount');

        $monthlyCashflow = $monthlyIncome - $monthlyExpense;

        $savingRate = $monthlyIncome > 0 ? round(($monthlyCashflow / $monthlyIncome) * 100, 2) : null;

        $assetSum = \App\Models\Asset::where('household_id', $householdId)
            ->where('is_active', true)
            ->where(function($q) use ($userId) {
                $q->where('owner_type', 'shared')
                  ->orWhere(function($subq) use ($userId) {
                      $subq->where('owner_type', 'personal')->where('owner_user_id', $userId);
                  });
            })
            ->sum('current_value');

        return [
            'total_balance' => (float) $totalBalance,
            'total_net_worth' => (float) ($totalBalance + $assetSum),
            'monthly_income' => (float) $monthlyIncome,
            'monthly_expense' => (float) $monthlyExpense,
            'monthly_cashflow' => (float) $monthlyCashflow,
            'saving_rate' => $savingRate,
        ];
    }

    /**
     * Get cashflow data for charting.
     */
    public function getCashflow($householdId, $userId, $months = 6)
    {
        $allowedAccountIds = $this->getAllowedAccounts($householdId, $userId);
        
        $query = Transaction::whereIn('account_id', $allowedAccountIds)
            ->whereIn('type', ['income', 'expense']);
            
        if ($months !== 'all') {
            $startDate = Carbon::now()->subMonths((int)$months - 1)->startOfMonth();
            $query->where('transaction_date', '>=', $startDate);
        }
        
        $transactions = $query->select(
                DB::raw('DATE_TRUNC(\'month\', transaction_date) as month'),
                'type',
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('month', 'type')
            ->orderBy('month')
            ->get();

        $cashflowData = [];
        
        if ($months === 'all') {
            $earliestTx = Transaction::whereIn('account_id', $allowedAccountIds)
                ->orderBy('transaction_date', 'asc')
                ->first();
            
            if ($earliestTx) {
                $start = Carbon::parse($earliestTx->transaction_date)->startOfMonth();
                $end = Carbon::now()->startOfMonth();
                $diffInMonths = $start->diffInMonths($end);
                $monthsInt = $diffInMonths + 1;
                
                for ($i = $monthsInt - 1; $i >= 0; $i--) {
                    $month = Carbon::now()->subMonths($i)->format('Y-m');
                    $cashflowData[$month] = [
                        'month' => $month,
                        'income' => 0,
                        'expense' => 0,
                        'cashflow' => 0,
                    ];
                }
            }
        } else {
            // Initialize empty months
            for ($i = (int)$months - 1; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i)->format('Y-m');
                $cashflowData[$month] = [
                    'month' => $month,
                    'income' => 0,
                    'expense' => 0,
                    'cashflow' => 0,
                ];
            }
        }

        // Fill data
        foreach ($transactions as $tx) {
            $monthStr = Carbon::parse($tx->month)->format('Y-m');
            if (isset($cashflowData[$monthStr])) {
                if ($tx->type === 'income') {
                    $cashflowData[$monthStr]['income'] = (float) $tx->total;
                } else {
                    $cashflowData[$monthStr]['expense'] = (float) $tx->total;
                }
                $cashflowData[$monthStr]['cashflow'] = $cashflowData[$monthStr]['income'] - $cashflowData[$monthStr]['expense'];
            }
        }

        return array_values($cashflowData);
    }

    /**
     * Helper to get allowed accounts for the user (personal + shared).
     */
    private function getAllowedAccounts($householdId, $userId)
    {
        return Account::where('household_id', $householdId)
            ->where(function($q) use ($userId) {
                $q->where('owner_type', 'shared')
                  ->orWhere(function($subq) use ($userId) {
                      $subq->where('owner_type', 'personal')->where('owner_user_id', $userId);
                  });
            })->pluck('id')->toArray();
    }
}
