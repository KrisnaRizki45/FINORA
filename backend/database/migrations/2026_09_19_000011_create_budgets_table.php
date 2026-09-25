<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('household_id');
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
            
            // A budget is usually tied to an expense category
            $table->uuid('category_id');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            
            $table->decimal('amount', 20, 2); // The spending limit
            $table->string('period')->default('monthly'); // 'monthly', 'weekly', 'yearly'
            
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            
            // A household should only have one active budget per category per period
            $table->unique(['household_id', 'category_id', 'period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
