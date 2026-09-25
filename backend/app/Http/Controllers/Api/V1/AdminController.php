<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Household;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get system statistics.
     */
    public function stats()
    {
        $usersCount = User::count();
        $householdsCount = Household::count();
        $transactionsCount = Transaction::count();

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $usersCount,
                'households' => $householdsCount,
                'transactions' => $transactionsCount,
            ]
        ]);
    }

    /**
     * Get all users with pagination and search.
     */
    public function users(Request $request)
    {
        $query = User::query();

        // Search
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->where(DB::raw('LOWER(name)'), 'like', "%{$search}%")
                  ->orWhere(DB::raw('LOWER(email)'), 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->input('per_page', 10);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Map users to include active household ID (optional, simple logic)
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                // In a real app we might load household eagerly, for MVP keeping it simple
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total()
            ]
        ]);
    }

    /**
     * Get single user details.
     */
    public function show($id)
    {
        $user = User::with('householdMembers.household')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update a user (Admin only).
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|string|in:user,admin',
            'status' => 'sometimes|string|in:active,inactive',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Delete a user (Admin only).
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting oneself
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account.'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
