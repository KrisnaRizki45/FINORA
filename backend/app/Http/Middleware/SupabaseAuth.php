<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class SupabaseAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Token not provided.',
                'errors' => []
            ], 401);
        }

        try {
            // Note: In production, we MUST verify this token's signature using SUPABASE_JWT_SECRET
            // For MVP setup, assuming JWT parsing logic here.
            // A library like firebase/php-jwt should be used.
            
            // Dummy decoding logic (DO NOT USE IN PRODUCTION without signature verification)
            $tokenParts = explode('.', $token);
            if (count($tokenParts) !== 3) {
                throw new \Exception('Invalid token format');
            }
            
            $payload = json_decode(base64_decode($tokenParts[1]));
            
            if (!$payload || !isset($payload->sub)) {
                throw new \Exception('Invalid token payload');
            }

            // Find the user in the local database by their Supabase ID
            $user = User::find($payload->sub);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. User not found in local database.',
                    'errors' => []
                ], 401);
            }

            // Log the user into Laravel's Auth guard for this request
            Auth::login($user);

            return $next($request);

        } catch (\Exception $e) {
            Log::error('Supabase Auth Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Invalid or expired token.',
                'errors' => []
            ], 401);
        }
    }
}
