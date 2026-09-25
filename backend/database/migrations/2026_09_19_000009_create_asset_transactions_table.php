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
        Schema::create('asset_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('asset_id');
            $table->foreign('asset_id')->references('id')->on('assets')->onDelete('cascade');
            
            $table->uuid('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->date('transaction_date');
            
            $table->string('type'); // 'buy', 'sell', 'dividend', 'fee', 'adjustment'
            
            $table->decimal('units', 24, 8)->default(0); // Can be negative for sell
            $table->decimal('price_per_unit', 20, 2)->default(0);
            $table->decimal('fee_amount', 20, 2)->default(0);
            
            // The total monetary value impact (price * units + fees)
            $table->decimal('total_amount', 20, 2)->default(0); 
            
            // Optional link to cash transaction (if the asset was bought using a linked bank account)
            $table->uuid('linked_transaction_id')->nullable();
            $table->foreign('linked_transaction_id')->references('id')->on('transactions')->onDelete('set null');
            
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_transactions');
    }
};
