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
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['household_id', 'transaction_date']);
            $table->index('category_id');
            $table->index('account_id');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->index(['household_id', 'type']);
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->index('household_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['household_id', 'transaction_date']);
            $table->dropIndex(['category_id']);
            $table->dropIndex(['account_id']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['household_id', 'type']);
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->dropIndex(['household_id']);
        });
    }
};
