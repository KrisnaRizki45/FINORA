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
        Schema::create('assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('household_id');
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
            
            $table->string('name'); // e.g. 'Bitcoin', 'Antam Gold', 'Bank BCA'
            $table->string('type'); // 'gold', 'stock', 'crypto', 'mutual_fund', 'bond', 'property', 'vehicle', 'business'
            $table->string('symbol')->nullable(); // e.g. 'BTC', 'BBCA.JK'
            
            $table->string('owner_type')->default('shared'); // 'personal' or 'shared'
            $table->uuid('owner_user_id')->nullable();
            $table->foreign('owner_user_id')->references('id')->on('users')->onDelete('set null');
            
            // Assets need high precision for units (especially crypto)
            $table->decimal('current_units', 24, 8)->default(0);
            
            // Financial values
            $table->decimal('average_buy_price', 20, 2)->default(0);
            $table->decimal('current_value', 20, 2)->default(0); // The last known total fiat value
            
            $table->string('currency', 10)->default('IDR');
            $table->text('notes')->nullable();
            
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
        Schema::dropIfExists('assets');
    }
};
