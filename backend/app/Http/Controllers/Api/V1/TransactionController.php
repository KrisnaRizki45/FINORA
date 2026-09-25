<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\Account;
use App\Models\Category;

class TransactionController extends Controller
{
    /**
     * Display a paginated listing of transactions.
     */
    public function index(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $query = Transaction::with(['account', 'category', 'creator', 'transfer.toAccount', 'transfer.fromAccount'])
            ->where('household_id', $householdId);

        // Security: Filter out accounts the user shouldn't see
        $allowedAccountIds = Account::where('household_id', $householdId)
            ->where(function($q) use ($userId) {
                $q->where('owner_type', 'shared')
                  ->orWhere(function($subq) use ($userId) {
                      $subq->where('owner_type', 'personal')->where('owner_user_id', $userId);
                  });
            })->pluck('id')->toArray();

        $query->whereIn('account_id', $allowedAccountIds);

        // Apply filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->has('account_id')) {
            $query->where('account_id', $request->account_id);
        }
        
        if ($request->has('from') && $request->has('to')) {
            $query->whereBetween('transaction_date', [$request->from, $request->to]);
        }

        // Sort (default: newest first)
        $query->orderBy('transaction_date', 'desc')->orderBy('created_at', 'desc');

        $transactions = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'Transactions retrieved successfully',
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'last_page' => $transactions->lastPage(),
            ]
        ]);
    }

    /**
     * Store a newly created income or expense transaction.
     */
    public function store(Request $request)
    {
        $request->validate([
            'account_id' => 'required|uuid',
            'category_id' => 'required|uuid',
            'type' => ['required', Rule::in(['income', 'expense'])],
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();

        // Validate account access
        $account = Account::where('household_id', $householdId)->findOrFail($request->account_id);
        if ($account->owner_type === 'personal' && $account->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to post to this personal account'], 403);
        }

        // Validate category
        $category = Category::where('household_id', $householdId)->findOrFail($request->category_id);
        if ($category->type !== $request->type) {
            return response()->json(['success' => false, 'message' => 'Category type does not match transaction type'], 422);
        }

        // Ensure transactional integrity (Atomic)
        DB::beginTransaction();

        try {
            $transaction = Transaction::create([
                'household_id' => $householdId,
                'created_by' => $userId,
                'account_id' => $request->account_id,
                'category_id' => $request->category_id,
                'type' => $request->type,
                'amount' => $request->amount,
                'transaction_date' => $request->transaction_date,
                'description' => $request->description,
                'notes' => $request->notes,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => ucfirst($request->type) . ' created successfully',
                'data' => $transaction->load(['account', 'category'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to create transaction', 'errors' => [$e->getMessage()]], 500);
        }
    }

    /**
     * Create a transfer between two accounts.
     */
    public function transfer(Request $request)
    {
        $request->validate([
            'from_account_id' => 'required|uuid|different:to_account_id',
            'to_account_id' => 'required|uuid',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string|max:255',
        ]);

        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();

        // Validate accounts
        $fromAccount = Account::where('household_id', $householdId)->findOrFail($request->from_account_id);
        $toAccount = Account::where('household_id', $householdId)->findOrFail($request->to_account_id);

        if ($fromAccount->owner_type === 'personal' && $fromAccount->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to transfer from this personal account'], 403);
        }

        if ($toAccount->owner_type === 'personal' && $toAccount->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to transfer to this personal account'], 403);
        }

        DB::beginTransaction();

        try {
            // The main transaction record represents the outbound portion
            $transaction = Transaction::create([
                'household_id' => $householdId,
                'created_by' => $userId,
                'account_id' => $fromAccount->id,
                'category_id' => null, // Transfers don't have categories
                'type' => 'transfer',
                'amount' => $request->amount,
                'transaction_date' => $request->transaction_date,
                'description' => $request->description,
            ]);

            Transfer::create([
                'transaction_id' => $transaction->id,
                'from_account_id' => $fromAccount->id,
                'to_account_id' => $toAccount->id,
                'amount' => $request->amount,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transfer created successfully',
                'data' => $transaction->load('transfer.toAccount')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to create transfer', 'errors' => [$e->getMessage()]], 500);
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show(Request $request, string $id)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $transaction = Transaction::with(['account', 'category', 'creator', 'transfer.toAccount', 'transfer.fromAccount'])
            ->where('household_id', $householdId)
            ->findOrFail($id);

        // If the account involved is personal and doesn't belong to the user, block access
        if ($transaction->account->owner_type === 'personal' && $transaction->account->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaction retrieved successfully',
            'data' => $transaction
        ]);
    }

    /**
     * Soft delete a transaction.
     */
    public function destroy(Request $request, string $id)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $transaction = Transaction::with('account')->where('household_id', $householdId)->findOrFail($id);

        if ($transaction->account->owner_type === 'personal' && $transaction->account->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        DB::beginTransaction();

        try {
            $transaction->deleted_by = $userId;
            $transaction->save();
            $transaction->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaction deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete transaction', 'errors' => [$e->getMessage()]], 500);
        }
    }
    /**
     * Update a transaction.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'account_id' => 'sometimes|uuid',
            'category_id' => 'sometimes|uuid|nullable',
            'amount' => 'sometimes|numeric|min:0.01',
            'transaction_date' => 'sometimes|date',
            'description' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();

        $transaction = Transaction::with(['account', 'category'])->where('household_id', $householdId)->findOrFail($id);

        // Security check
        if ($transaction->account->owner_type === 'personal' && $transaction->account->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }

        // If changing account, validate new account
        if ($request->has('account_id') && $request->account_id !== $transaction->account_id) {
            $newAccount = Account::where('household_id', $householdId)->findOrFail($request->account_id);
            if ($newAccount->owner_type === 'personal' && $newAccount->owner_user_id !== $userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized to post to new account'], 403);
            }
        }

        DB::beginTransaction();

        try {
            $transaction->update($request->only([
                'account_id',
                'category_id',
                'amount',
                'transaction_date',
                'description',
                'notes',
            ]));
            
            // If it's a transfer, update transfer record amount if amount changed
            if ($transaction->type === 'transfer' && $request->has('amount')) {
                $transfer = Transfer::where('transaction_id', $transaction->id)->first();
                if ($transfer) {
                    $transfer->update(['amount' => $request->amount]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaction updated successfully',
                'data' => $transaction->fresh(['account', 'category', 'transfer.toAccount', 'transfer.fromAccount'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to update transaction', 'errors' => [$e->getMessage()]], 500);
        }
    }
}
