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
        Schema::create('transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Link to the parent transaction record
            $table->uuid('transaction_id');
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
            
            $table->uuid('from_account_id');
            $table->foreign('from_account_id')->references('id')->on('accounts')->onDelete('cascade');
            
            $table->uuid('to_account_id');
            $table->foreign('to_account_id')->references('id')->on('accounts')->onDelete('cascade');
            
            $table->decimal('amount', 20, 2);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
