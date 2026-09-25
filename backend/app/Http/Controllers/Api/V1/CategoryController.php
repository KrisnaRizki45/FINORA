<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(Request $request)
    {
        $householdId = $request->attributes->get('household_id');
        
        $query = Category::where('household_id', $householdId);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $categories = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Categories retrieved successfully',
            'data' => $categories
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['income', 'expense'])],
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
        ]);

        $householdId = $request->attributes->get('household_id');

        // Prevent duplicate category names for the same household and type
        $exists = Category::where('household_id', $householdId)
            ->where('type', $request->type)
            ->where('name', $request->name)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'A category with this name already exists',
                'errors' => []
            ], 422);
        }

        $category = Category::create([
            'household_id' => $householdId,
            'name' => $request->name,
            'type' => $request->type,
            'icon' => $request->icon,
            'color' => $request->color,
            'is_default' => false,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category
        ], 201);
    }

    /**
     * Display the specified category.
     */
    public function show(Request $request, string $id)
    {
        $householdId = $request->attributes->get('household_id');
        
        $category = Category::where('household_id', $householdId)->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Category retrieved successfully',
            'data' => $category
        ]);
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $householdId = $request->attributes->get('household_id');
        
        $category = Category::where('household_id', $householdId)->findOrFail($id);

        if ($request->has('name') && $request->name !== $category->name) {
            $exists = Category::where('household_id', $householdId)
                ->where('type', $category->type)
                ->where('name', $request->name)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'A category with this name already exists',
                    'errors' => []
                ], 422);
            }
        }

        $category->update($request->only(['name', 'icon', 'color', 'is_active']));

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category
        ]);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $householdId = $request->attributes->get('household_id');
        $category = Category::where('household_id', $householdId)->findOrFail($id);
        
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}
