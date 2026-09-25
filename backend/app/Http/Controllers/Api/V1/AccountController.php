<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Account;
use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    /**
     * Display a listing of the accounts for the active household.
     */
    public function index(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        
        $query = Account::where('household_id', $householdId);

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('owner_type') && in_array($request->owner_type, ['shared', 'personal'])) {
            $query->where('owner_type', $request->owner_type);
        }

        // Apply visibility rules based on owner_type
        $userId = Auth::id();
        $query->where(function($q) use ($userId) {
            $q->where('owner_type', 'shared')
              ->orWhere(function($subq) use ($userId) {
                  $subq->where('owner_type', 'personal')->where('owner_user_id', $userId);
              });
        });

        $summaryQuery = clone $query;
        $totalBalance = $summaryQuery->get()->sum(function($account) {
            return $account->current_balance ?? $account->initial_balance ?? 0;
        });

        $accounts = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Accounts retrieved successfully',
            'data' => $accounts->items(),
            'meta' => [
                'current_page' => $accounts->currentPage(),
                'per_page' => $accounts->perPage(),
                'total' => $accounts->total(),
                'last_page' => $accounts->lastPage(),
            ],
            'summary' => [
                'total_balance' => $totalBalance
            ]
        ]);
    }

    /**
     * Store a newly created account.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['bank', 'ewallet', 'cash', 'credit_card', 'other'])],
            'institution' => 'nullable|string|max:255',
            'owner_type' => ['required', Rule::in(['personal', 'shared'])],
            'currency' => 'nullable|string|max:10',
            'initial_balance' => 'numeric',
        ]);

        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();

        $account = Account::create([
            'household_id' => $householdId,
            'name' => $request->name,
            'type' => $request->type,
            'institution' => $request->institution,
            'owner_type' => $request->owner_type,
            'owner_user_id' => $request->owner_type === 'personal' ? $userId : null,
            'currency' => $request->currency ?? 'IDR',
            'initial_balance' => $request->initial_balance ?? 0,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully',
            'data' => $account
        ], 201);
    }

    /**
     * Display the specified account.
     */
    public function show(Request $request, string $id)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $account = Account::where('household_id', $householdId)->findOrFail($id);

        // Security check for personal accounts
        if ($account->owner_type === 'personal' && $account->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access to this personal account'], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Account retrieved successfully',
            'data' => $account
        ]);
    }

    /**
     * Update the specified account.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => ['sometimes', Rule::in(['bank', 'ewallet', 'cash', 'credit_card', 'other'])],
            'institution' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $account = Account::where('household_id', $householdId)->findOrFail($id);

        if ($account->owner_type === 'personal' && $account->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to update this personal account'], 403);
        }

        $account->update($request->only(['name', 'type', 'institution', 'is_active']));

        return response()->json([
            'success' => true,
            'message' => 'Account updated successfully',
            'data' => $account
        ]);
    }

    /**
     * Soft delete (archive) the specified account.
     */
    public function destroy(Request $request, string $id)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $account = Account::where('household_id', $householdId)->findOrFail($id);

        if ($account->owner_type === 'personal' && $account->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to delete this personal account'], 403);
        }

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account archived successfully'
        ]);
    }
}
