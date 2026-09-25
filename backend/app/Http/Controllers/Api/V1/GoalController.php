<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Goal;
use Illuminate\Support\Facades\DB;

class GoalController extends Controller
{
    /**
     * Display a listing of goals.
     */
    public function index(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        
        $goals = Goal::where('household_id', $householdId)
            ->orderBy('is_completed', 'asc')
            ->orderBy('target_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Goals retrieved successfully',
            'data' => $goals
        ]);
    }

    /**
     * Store a newly created goal.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'target_date' => 'nullable|date',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $householdId = $request->attributes->get('household_id');

        $goal = Goal::create([
            'household_id' => $householdId,
            'name' => $request->name,
            'target_amount' => $request->target_amount,
            'current_amount' => 0,
            'target_date' => $request->target_date,
            'icon' => $request->icon,
            'color' => $request->color,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Goal created successfully',
            'data' => $goal
        ], 201);
    }

    /**
     * Update the specified goal.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'target_amount' => 'sometimes|numeric|min:1',
            'target_date' => 'nullable|date',
        ]);

        $householdId = $request->attributes->get('household_id');
        $goal = Goal::where('household_id', $householdId)->findOrFail($id);

        $goal->update($request->only(['name', 'target_amount', 'target_date', 'icon', 'color']));
        
        // Auto-check completion
        if ($goal->current_amount >= $goal->target_amount && !$goal->is_completed) {
            $goal->update(['is_completed' => true]);
        } elseif ($goal->current_amount < $goal->target_amount && $goal->is_completed) {
            $goal->update(['is_completed' => false]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Goal updated successfully',
            'data' => $goal
        ]);
    }

    /**
     * Contribute money towards a goal.
     */
    public function contribute(Request $request, string $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01'
        ]);

        $householdId = $request->attributes->get('household_id');
        $goal = Goal::where('household_id', $householdId)->findOrFail($id);

        DB::transaction(function () use ($goal, $request) {
            $goal->current_amount += $request->amount;
            if ($goal->current_amount >= $goal->target_amount) {
                $goal->is_completed = true;
            }
            $goal->save();
        });

        return response()->json([
            'success' => true,
            'message' => 'Contribution added successfully',
            'data' => $goal
        ]);
    }

    /**
     * Remove the specified goal.
     */
    public function destroy(Request $request, string $id)
    {
        $householdId = $request->attributes->get('household_id');
        $goal = Goal::where('household_id', $householdId)->findOrFail($id);
        $goal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Goal deleted successfully'
        ]);
    }
}
