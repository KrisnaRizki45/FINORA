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
        Schema::create('accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('household_id');
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
            
            $table->string('name');
            $table->string('type'); // 'bank', 'ewallet', 'cash', 'credit_card', 'other'
            $table->string('institution')->nullable();
            
            $table->string('owner_type')->default('shared'); // 'personal' or 'shared'
            $table->uuid('owner_user_id')->nullable();
            $table->foreign('owner_user_id')->references('id')->on('users')->onDelete('set null');
            
            $table->string('currency', 10)->default('IDR');
            
            // NUMERIC(20,2) is required by BRD for all monetary values
            $table->decimal('initial_balance', 20, 2)->default(0);
            
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
