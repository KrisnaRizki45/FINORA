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
        Schema::create('household_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('household_id');
            $table->foreign('household_id')->references('id')->on('households')->onDelete('cascade');
            
            $table->uuid('invited_by');
            $table->foreign('invited_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->string('invited_email');
            $table->string('token')->unique();
            $table->string('status')->default('pending'); // pending, accepted, expired, revoked
            $table->timestamp('expires_at');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_invitations');
    }
};
