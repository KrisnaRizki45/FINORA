<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\HouseholdInvitation;

class HouseholdController extends Controller
{
    /**
     * Get the current active household.
     */
    public function show(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        
        if (!$householdId) {
            return response()->json([
                'success' => false,
                'message' => 'No active household found'
            ], 404);
        }

        $household = Household::find($householdId);

        return response()->json([
            'success' => true,
            'message' => 'Household retrieved successfully',
            'data' => $household
        ]);
    }

    /**
     * Create a new household.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'currency' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:50',
        ]);

        $user = Auth::user();

        // Ensure user doesn't already have an active household
        $existing = HouseholdMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You already belong to an active household.',
                'errors' => []
            ], 422);
        }

        DB::beginTransaction();

        try {
            $household = Household::create([
                'name' => $request->name,
                'currency' => $request->currency ?? 'IDR',
                'timezone' => $request->timezone ?? 'Asia/Jakarta',
                'created_by' => $user->id,
                'invite_code' => strtoupper(Str::random(6)),
            ]);

            HouseholdMember::create([
                'household_id' => $household->id,
                'user_id' => $user->id,
                'role' => 'owner',
                'status' => 'active',
                'joined_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Household created successfully',
                'data' => $household
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create household',
                'errors' => [$e->getMessage()]
            ], 500);
        }
    }

    /**
     * Update the active household settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'currency' => 'sometimes|string|max:10',
            'timezone' => 'sometimes|string|max:50',
        ]);

        $householdId = $request->attributes->get('household_id');
        $role = $request->attributes->get('household_role');

        if ($role !== 'owner') {
            return response()->json(['success' => false, 'message' => 'Only the owner can update household settings'], 403);
        }

        $household = Household::find($householdId);
        $household->update($request->only(['name', 'currency', 'timezone']));

        return response()->json([
            'success' => true,
            'message' => 'Household updated successfully',
            'data' => $household
        ]);
    }

    /**
     * Remove a member from the household.
     */
    public function removeMember(Request $request, $userId)
    {
        $householdId = $request->attributes->get('household_id');
        $role = $request->attributes->get('household_role');

        if ($role !== 'owner') {
            return response()->json(['success' => false, 'message' => 'Only the owner can remove members'], 403);
        }

        if ($userId == Auth::id()) {
            return response()->json(['success' => false, 'message' => 'You cannot remove yourself. Use leave instead.'], 400);
        }

        $member = HouseholdMember::where('household_id', $householdId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $member->delete();

        return response()->json(['success' => true, 'message' => 'Member removed successfully']);
    }

    /**
     * Update a member's role.
     */
    public function updateRole(Request $request, $userId)
    {
        $request->validate(['role' => 'required|in:owner,member']);
        
        $householdId = $request->attributes->get('household_id');
        $role = $request->attributes->get('household_role');

        if ($role !== 'owner') {
            return response()->json(['success' => false, 'message' => 'Only the owner can update roles'], 403);
        }

        $member = HouseholdMember::where('household_id', $householdId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $member->update(['role' => $request->role]);

        return response()->json(['success' => true, 'message' => 'Role updated successfully']);
    }

    /**
     * Leave the active household.
     */
    public function leave(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        $userId = Auth::id();

        $member = HouseholdMember::where('household_id', $householdId)
            ->where('user_id', $userId)
            ->firstOrFail();

        if ($member->role === 'owner') {
            $otherOwners = HouseholdMember::where('household_id', $householdId)
                ->where('role', 'owner')
                ->where('user_id', '!=', $userId)
                ->exists();

            if (!$otherOwners) {
                return response()->json(['success' => false, 'message' => 'You cannot leave as the only owner. Transfer ownership or delete the household.'], 400);
            }
        }

        $member->delete();

        return response()->json(['success' => true, 'message' => 'You have left the household']);
    }

    /**
     * Get all active members of the household.
     */
    public function members(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        $currentUserId = Auth::id();
        
        $members = HouseholdMember::with('user:id,name,email,avatar_url')
            ->where('household_id', $householdId)
            ->get();

        $formattedMembers = $members->map(function ($member) use ($currentUserId) {
            return [
                'id' => $member->id,
                'user_id' => $member->user_id,
                'name' => $member->user ? $member->user->name : 'Unknown User',
                'email' => $member->user ? $member->user->email : '',
                'avatar_url' => $member->user ? $member->user->avatar_url : null,
                'role' => $member->role,
                'status' => $member->status ?? 'active',
                'joined_at' => $member->created_at,
                'is_current_user' => $member->user_id === $currentUserId
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Members retrieved successfully',
            'data' => $formattedMembers
        ]);
    }

    /**
     * Invite a partner to the household.
     */
    public function invite(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $householdId = $request->attributes->get('household_id');
        $role = $request->attributes->get('household_role');

        if ($role !== 'owner') {
            return response()->json(['success' => false, 'message' => 'Only the owner can invite members'], 403);
        }

        // Generate a secure token
        $token = Str::random(32);

        $invitation = HouseholdInvitation::create([
            'household_id' => $householdId,
            'invited_by' => Auth::id(),
            'invited_email' => $request->email,
            'token' => $token,
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);

        // In a real app, an email would be dispatched here.
        // Mail::to($request->email)->send(new HouseholdInvitationMail($invitation));

        return response()->json([
            'success' => true,
            'message' => 'Invitation sent successfully',
            'data' => $invitation
        ], 201);
    }

    /**
     * Join a household using an invite code.
     */
    public function joinByCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $household = Household::where('invite_code', strtoupper($request->code))->first();

        if (!$household) {
            return response()->json(['success' => false, 'message' => 'Invalid invitation code'], 404);
        }

        $user = Auth::user();

        // Check if user is already in a household
        $existing = HouseholdMember::where('user_id', $user->id)->where('status', 'active')->exists();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'You already belong to an active household.'], 422);
        }

        DB::beginTransaction();

        try {
            $membership = HouseholdMember::create([
                'household_id' => $household->id,
                'user_id' => $user->id,
                'role' => 'member',
                'status' => 'active',
                'joined_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Successfully joined household',
                'data' => $membership
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to join household: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Accept a household invitation.
     */
    public function acceptInvitation(Request $request, $token)
    {
        $invitation = HouseholdInvitation::where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (!$invitation) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired invitation'], 404);
        }

        if ($invitation->expires_at < now()) {
            $invitation->update(['status' => 'expired']);
            return response()->json(['success' => false, 'message' => 'Invitation has expired'], 400);
        }

        $user = Auth::user();

        if ($user->email !== $invitation->invited_email) {
            return response()->json(['success' => false, 'message' => 'This invitation was sent to a different email address'], 403);
        }

        DB::beginTransaction();

        try {
            $membership = HouseholdMember::create([
                'household_id' => $invitation->household_id,
                'user_id' => $user->id,
                'role' => 'member',
                'status' => 'active',
                'joined_at' => now(),
            ]);

            $invitation->update(['status' => 'accepted']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Successfully joined household',
                'data' => $membership
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to join household: ' . $e->getMessage()], 500);
        }
    }
}
