<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Asset;
use App\Models\AssetTransaction;

class AssetController extends Controller
{
    /**
     * Display a listing of the assets.
     */
    public function index(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();
        
        $query = Asset::where('household_id', $householdId);

        // Security: Filter out personal assets not belonging to user
        $query->where(function($q) use ($userId) {
            $q->where('owner_type', 'shared')
              ->orWhere(function($subq) use ($userId) {
                  $subq->where('owner_type', 'personal')->where('owner_user_id', $userId);
              });
        });

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('owner_type') && in_array($request->owner_type, ['shared', 'personal'])) {
            $query->where('owner_type', $request->owner_type);
        }

        $summaryQuery = clone $query;
        $allAssets = $summaryQuery->get(['current_value', 'current_units', 'average_buy_price']);
        $totalValue = $allAssets->sum('current_value');
        $totalCostBasis = $allAssets->sum(function($asset) {
            $units = $asset->current_units ?? 0;
            $price = $asset->average_buy_price ?? 0;
            return $units * $price;
        });

        $assets = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Assets retrieved successfully',
            'data' => $assets->items(),
            'meta' => [
                'current_page' => $assets->currentPage(),
                'per_page' => $assets->perPage(),
                'total' => $assets->total(),
                'last_page' => $assets->lastPage(),
            ],
            'summary' => [
                'total_value' => $totalValue,
                'total_cost_basis' => $totalCostBasis
            ]
        ]);
    }

    /**
     * Store a newly created asset profile.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['gold', 'stock', 'crypto', 'mutual_fund', 'bond', 'property', 'vehicle', 'business', 'other'])],
            'symbol' => 'nullable|string|max:20',
            'owner_type' => ['required', Rule::in(['personal', 'shared'])],
            'currency' => 'nullable|string|max:10',
            'current_units' => 'numeric',
            'average_buy_price' => 'numeric',
            'quantity' => 'numeric',
            'average_cost' => 'numeric',
            'current_value' => 'numeric',
        ]);

        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();

        $asset = Asset::create([
            'household_id' => $householdId,
            'name' => $request->name,
            'type' => $request->type,
            'symbol' => $request->symbol,
            'owner_type' => $request->owner_type,
            'owner_user_id' => $request->owner_type === 'personal' ? $userId : null,
            'currency' => $request->currency ?? 'IDR',
            'current_units' => $request->quantity ?? $request->current_units ?? 1,
            'average_buy_price' => $request->average_cost ?? $request->average_buy_price ?? $request->current_value ?? 0,
            'current_value' => $request->current_value ?? 0,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Asset created successfully',
            'data' => $asset
        ], 201);
    }

    /**
     * Record a transaction (Buy, Sell, etc.) for a specific asset.
     */
    public function storeTransaction(Request $request, string $assetId)
    {
        $request->validate([
            'type' => ['required', Rule::in(['buy', 'sell', 'dividend', 'fee', 'adjustment'])],
            'transaction_date' => 'required|date',
            'units' => 'required|numeric',
            'price_per_unit' => 'required|numeric|min:0',
            'fee_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric',
            'linked_transaction_id' => 'nullable|uuid|exists:transactions,id',
        ]);

        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();

        $asset = Asset::where('household_id', $householdId)->findOrFail($assetId);

        if ($asset->owner_type === 'personal' && $asset->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access to this personal asset'], 403);
        }

        DB::beginTransaction();

        try {
            $feeAmount = $request->fee_amount ?? 0;
            
            $transaction = AssetTransaction::create([
                'asset_id' => $asset->id,
                'created_by' => $userId,
                'transaction_date' => $request->transaction_date,
                'type' => $request->type,
                'units' => $request->units,
                'price_per_unit' => $request->price_per_unit,
                'fee_amount' => $feeAmount,
                'total_amount' => $request->total_amount,
                'linked_transaction_id' => $request->linked_transaction_id,
            ]);

            // Recalculate Asset Metrics
            if ($request->type === 'buy') {
                $totalExistingCost = $asset->current_units * $asset->average_buy_price;
                $newPurchaseCost = $request->units * $request->price_per_unit; // Fees typically don't count towards asset basis in simple accounting, or they do depending on preference. We'll stick to unit * price.
                
                $newTotalUnits = $asset->current_units + $request->units;
                
                if ($newTotalUnits > 0) {
                    $asset->average_buy_price = ($totalExistingCost + $newPurchaseCost) / $newTotalUnits;
                }
                
                $asset->current_units = $newTotalUnits;
                
            } elseif ($request->type === 'sell') {
                $asset->current_units = $asset->current_units - $request->units;
                // Average buy price does not change on sell
            }

            // Estimate current value (units * last price)
            $asset->current_value = $asset->current_units * $request->price_per_unit;
            $asset->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Asset transaction recorded successfully',
                'data' => $transaction
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to record asset transaction', 'errors' => [$e->getMessage()]], 500);
        }
    }

    /**
     * Update the specified asset in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string',
            'symbol' => 'nullable|string|max:50',
            'owner_type' => ['sometimes', 'required', Rule::in(['personal', 'shared'])],
            'quantity' => 'sometimes|required|numeric',
            'average_cost' => 'sometimes|required|numeric|min:0',
            'current_value' => 'sometimes|required|numeric|min:0',
            'currency' => 'nullable|string|max:10',
        ]);

        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();

        $asset = Asset::where('household_id', $householdId)->findOrFail($id);

        if ($asset->owner_type === 'personal' && $asset->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access to this personal asset'], 403);
        }

        // Handle ownership transfer if owner_type changes
        if ($request->has('owner_type')) {
            $asset->owner_type = $request->owner_type;
            if ($request->owner_type === 'personal') {
                $asset->owner_user_id = $userId;
            } else {
                $asset->owner_user_id = null;
            }
        }

        if ($request->has('name')) $asset->name = $request->name;
        if ($request->has('type')) $asset->type = $request->type;
        if ($request->has('symbol')) $asset->symbol = $request->symbol;
        if ($request->has('currency')) $asset->currency = $request->currency;
        
        if ($request->has('quantity')) $asset->current_units = $request->quantity;
        if ($request->has('average_cost')) $asset->average_buy_price = $request->average_cost;
        if ($request->has('current_value')) $asset->current_value = $request->current_value;

        $asset->save();

        return response()->json([
            'success' => true,
            'message' => 'Asset updated successfully',
            'data' => $asset
        ]);
    }

    /**
     * Remove the specified asset from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();

        $asset = Asset::where('household_id', $householdId)->findOrFail($id);

        if ($asset->owner_type === 'personal' && $asset->owner_user_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access to this personal asset'], 403);
        }

        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset deleted successfully'
        ]);
    }
}
