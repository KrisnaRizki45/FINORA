<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HouseholdController;
use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\GoalController;
use App\Http\Controllers\Api\V1\BudgetController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'database' => 'ok', // In a real scenario, you might add a DB check here
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('v1')->group(function () {
    
    // Auth Routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth.supabase');
    Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth.supabase');
    Route::put('/auth/profile', [AuthController::class, 'profile'])->middleware('auth.supabase');

    // Admin Routes
    Route::middleware(['auth.supabase', 'admin'])->prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\V1\AdminController::class, 'stats']);
        Route::get('/users', [\App\Http\Controllers\Api\V1\AdminController::class, 'users']);
        Route::get('/users/{id}', [\App\Http\Controllers\Api\V1\AdminController::class, 'show']);
        Route::put('/users/{id}', [\App\Http\Controllers\Api\V1\AdminController::class, 'update']);
        Route::delete('/users/{id}', [\App\Http\Controllers\Api\V1\AdminController::class, 'destroy']);
    });

    // Protected Routes
    Route::middleware('auth.supabase')->group(function () {
        
        // Household Creation & Joining (No active household required)
        Route::post('/household', [HouseholdController::class, 'store']);
        Route::post('/household/join', [HouseholdController::class, 'joinByCode']);
        Route::post('/household/invitations/{token}/accept', [HouseholdController::class, 'acceptInvitation']);

        // Routes that require an active household
        Route::middleware('household.resolve')->group(function () {
            
            // Household Management
            Route::get('/household', [HouseholdController::class, 'show']);
            Route::put('/household', [HouseholdController::class, 'update']);
            Route::get('/household/members', [HouseholdController::class, 'members']);
            Route::delete('/household/members/{userId}', [HouseholdController::class, 'removeMember']);
            Route::put('/household/members/{userId}/role', [HouseholdController::class, 'updateRole']);
            Route::post('/household/leave', [HouseholdController::class, 'leave']);
            Route::post('/household/invitations', [HouseholdController::class, 'invite']);
            
            // Accounts
            Route::apiResource('accounts', AccountController::class);
            
            // Categories
            Route::apiResource('categories', CategoryController::class);
            
            // Transactions
            Route::post('transactions/transfer', [TransactionController::class, 'transfer']);
            Route::apiResource('transactions', TransactionController::class);
            
            // Assets
            Route::get('assets/{asset}/transactions', [AssetController::class, 'transactions']);
            Route::post('assets/{asset}/transactions', [AssetController::class, 'storeTransaction']);
            Route::apiResource('assets', AssetController::class);
            
            // Goals
            Route::post('goals/{goal}/contributions', [GoalController::class, 'contribute']);
            Route::post('goals/{goal}/withdrawals', [GoalController::class, 'withdraw']);
            Route::apiResource('goals', GoalController::class);
            
            // Budgets
            Route::apiResource('budgets', BudgetController::class);
            
            // Dashboard
            Route::prefix('dashboard')->group(function () {
                Route::get('summary', [DashboardController::class, 'summary']);
                Route::get('cashflow', [DashboardController::class, 'cashflow']);
                Route::get('net-worth', [DashboardController::class, 'netWorth']);
                Route::get('assets', [DashboardController::class, 'assets']);
                Route::get('categories', [DashboardController::class, 'categories']);
            });
            
            // Reports
            Route::prefix('reports')->group(function () {
                Route::get('monthly', [ReportController::class, 'monthly']);
                Route::get('cashflow', [ReportController::class, 'cashflow']);
                Route::get('net-worth', [ReportController::class, 'netWorth']);
                Route::get('spending', [ReportController::class, 'spending']);
            });
            
            // AI (Phase 2/3 placeholder)
            // Route::post('/ai/chat', [AiController::class, 'chat']);
        });
    });
});
