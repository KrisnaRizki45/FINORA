<?php

use App\Models\Household;
use App\Models\Category;
use Illuminate\Support\Str;

$households = Household::all();

$defaultCategories = [
    // Expenses
    ['name' => 'Food & Dining', 'type' => 'expense', 'icon' => '🍔', 'color' => '#EF4444'],
    ['name' => 'Transportation', 'type' => 'expense', 'icon' => '🚗', 'color' => '#F59E0B'],
    ['name' => 'Housing', 'type' => 'expense', 'icon' => '🏠', 'color' => '#10B981'],
    ['name' => 'Utilities', 'type' => 'expense', 'icon' => '⚡', 'color' => '#3B82F6'],
    ['name' => 'Entertainment', 'type' => 'expense', 'icon' => '🎬', 'color' => '#8B5CF6'],
    ['name' => 'Shopping', 'type' => 'expense', 'icon' => '🛍️', 'color' => '#EC4899'],
    ['name' => 'Healthcare', 'type' => 'expense', 'icon' => '💊', 'color' => '#EF4444'],
    ['name' => 'Education', 'type' => 'expense', 'icon' => '📚', 'color' => '#3B82F6'],
    ['name' => 'Personal Care', 'type' => 'expense', 'icon' => '💅', 'color' => '#F472B6'],
    // Incomes
    ['name' => 'Salary', 'type' => 'income', 'icon' => '💰', 'color' => '#10B981'],
    ['name' => 'Business', 'type' => 'income', 'icon' => '🏢', 'color' => '#3B82F6'],
    ['name' => 'Investments', 'type' => 'income', 'icon' => '📈', 'color' => '#8B5CF6'],
    ['name' => 'Gifts', 'type' => 'income', 'icon' => '🎁', 'color' => '#F59E0B'],
    ['name' => 'Other Income', 'type' => 'income', 'icon' => '💵', 'color' => '#6B7280'],
];

$seededCount = 0;

foreach ($households as $household) {
    // Check if household already has categories
    $existingCategories = Category::where('household_id', $household->id)->count();
    
    if ($existingCategories === 0) {
        foreach ($defaultCategories as $cat) {
            Category::create([
                'id' => Str::uuid(),
                'household_id' => $household->id,
                'name' => $cat['name'],
                'type' => $cat['type'],
                'icon' => $cat['icon'],
                'color' => $cat['color'],
                'is_default' => true,
                'is_active' => true,
            ]);
        }
        echo "Seeded categories for Household: " . $household->name . "\n";
        $seededCount++;
    }
}

echo "Done seeding. Seeded $seededCount households.\n";
