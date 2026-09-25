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
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('household_id');
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
            
            $table->uuid('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->uuid('account_id');
            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('cascade');
            
            // Category can be null for 'transfer' type transactions
            $table->uuid('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            
            $table->string('type'); // 'income', 'expense', 'transfer'
            
            // Monetary value requires high precision
            $table->decimal('amount', 20, 2);
            
            $table->date('transaction_date');
            
            $table->string('description')->nullable();
            $table->text('notes')->nullable();
            $table->jsonb('metadata')->nullable();
            
            $table->timestamps();
            
            // Soft delete with tracking
            $table->softDeletes();
            $table->uuid('deleted_by')->nullable();
            $table->foreign('deleted_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
