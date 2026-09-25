<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\HouseholdMember;

class AuthController extends Controller
{
    /**
     * Login / Sync User from Supabase
     * Receives the Supabase JWT token via middleware, extracts the user ID,
     * and ensures they exist in our local database.
     */
    public function login(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['success' => false, 'message' => 'No token provided'], 401);
        }

        try {
            // Simplified decoding logic for the MVP (should verify signature in production)
            $tokenParts = explode('.', $token);
            $payload = json_decode(base64_decode($tokenParts[1]));

            if (!$payload || !isset($payload->sub)) {
                return response()->json(['success' => false, 'message' => 'Invalid token payload'], 401);
            }

            // Sync user to local DB
            $user = User::updateOrCreate(
                ['id' => $payload->sub],
                [
                    'email' => $payload->email ?? '',
                    'name' => $payload->user_metadata->name ?? 'User',
                ]
            );

            // Log them in locally
            Auth::login($user);

            // Fetch their active household if they have one
            $membership = HouseholdMember::with('household')
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'User synced successfully',
                'data' => [
                    'user' => $user,
                    'household' => $membership ? $membership->household : null,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to sync user: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get Current User & Household
     */
    public function me(Request $request)
    {
        $user = Auth::user();
        
        $membership = HouseholdMember::with('household')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Current user retrieved',
            'data' => [
                'user' => $user,
                'household' => $membership ? $membership->household : null,
            ]
        ]);
    }

    /**
     * Update Profile
     */
    public function profile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'nullable|string|max:255',
            'avatar_url' => 'nullable|string|max:1024',
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('avatar_url')) {
            $user->avatar_url = $request->avatar_url;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }
}
