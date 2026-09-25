<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\HouseholdMember;

class ResolveHousehold
{
    /**
     * Handle an incoming request.
     * Ensure the authenticated user has an active household.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
                'errors' => []
            ], 401);
        }

        // Find the active household for this user.
        // For MVP, a user belongs to exactly one household.
        $membership = HouseholdMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$membership) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You do not belong to any active household.',
                'errors' => []
            ], 403);
        }

        // Inject the household_id into the request so controllers can use it safely
        // WITHOUT trusting any household_id sent from the client payload.
        $request->attributes->set('household_id', $membership->household_id);
        $request->attributes->set('household_role', $membership->role);

        return $next($request);
    }
}
