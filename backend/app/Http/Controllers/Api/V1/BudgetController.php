<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\Account;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BudgetController extends Controller
{
    /**
     * Display a listing of budgets with calculated current spending.
     */
    public function index(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $budgets = Budget::with('category')->where('household_id', $householdId)->paginate($request->get('per_page', 15));

        // Calculate current spending for each budget
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Get allowed accounts to check transactions against
        $allowedAccountIds = Account::where('household_id', $householdId)
            ->where(function($q) use ($userId) {
                $q->where('owner_type', 'shared')
                  ->orWhere(function($subq) use ($userId) {
                      $subq->where('owner_type', 'personal')->where('owner_user_id', $userId);
                  });
            })->pluck('id')->toArray();

        $budgets->getCollection()->transform(function ($budget) use ($startOfMonth, $endOfMonth, $allowedAccountIds) {
            $spent = Transaction::where('category_id', $budget->category_id)
                ->whereIn('account_id', $allowedAccountIds)
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
                ->sum('amount');
            
            $budget->current_spent = (float) $spent;
            $budget->remaining = (float) ($budget->amount - $spent);
            $budget->progress_percentage = $budget->amount > 0 ? min(100, round(($spent / $budget->amount) * 100, 2)) : 0;
            
            return $budget;
        });

        $totalBudget = Budget::where('household_id', $householdId)->sum('amount');
        $budgetCategoryIds = Budget::where('household_id', $householdId)->pluck('category_id');
        $totalSpent = Transaction::whereIn('category_id', $budgetCategoryIds)
            ->whereIn('account_id', $allowedAccountIds)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        return response()->json([
            'success' => true,
            'message' => 'Budgets retrieved successfully',
            'data' => $budgets->items(),
            'meta' => [
                'current_page' => $budgets->currentPage(),
                'per_page' => $budgets->perPage(),
                'total' => $budgets->total(),
                'last_page' => $budgets->lastPage(),
            ],
            'summary' => [
                'total_budget' => $totalBudget,
                'total_spent' => $totalSpent
            ]
        ]);
    }

    /**
     * Store a newly created budget.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|uuid|exists:categories,id',
            'amount' => 'required|numeric|min:1',
            'period' => ['sometimes', Rule::in(['monthly', 'weekly', 'yearly'])],
        ]);

        $householdId = $request->attributes->get('household_id');

        // Ensure category belongs to household
        $category = Category::where('household_id', $householdId)->findOrFail($request->category_id);

        // Check for duplicates
        $exists = Budget::where('household_id', $householdId)
            ->where('category_id', $request->category_id)
            ->where('period', $request->period ?? 'monthly')
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'A budget for this category and period already exists',
                'errors' => []
            ], 422);
        }

        $budget = Budget::create([
            'household_id' => $householdId,
            'category_id' => $request->category_id,
            'amount' => $request->amount,
            'period' => $request->period ?? 'monthly',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Budget created successfully',
            'data' => $budget->load('category')
        ], 201);
    }

    /**
     * Update the specified budget.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'is_active' => 'sometimes|boolean',
        ]);

        $householdId = $request->attributes->get('household_id');
        $budget = Budget::where('household_id', $householdId)->findOrFail($id);

        $budget->update($request->only(['amount', 'is_active']));

        return response()->json([
            'success' => true,
            'message' => 'Budget updated successfully',
            'data' => $budget
        ]);
    }

    /**
     * Remove the specified budget.
     */
    public function destroy(Request $request, string $id)
    {
        $householdId = $request->attributes->get('household_id');
        $budget = Budget::where('household_id', $householdId)->findOrFail($id);
        $budget->delete();

        return response()->json([
            'success' => true,
            'message' => 'Budget deleted successfully'
        ]);
    }
}
