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
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('household_id');
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
            
            $table->string('name');
            $table->string('type'); // 'income' or 'expense'
            
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
