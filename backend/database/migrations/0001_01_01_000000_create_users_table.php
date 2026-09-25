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
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Must match Supabase Auth UUID
            $table->string('email')->unique();
            $table->string('name');
            $table->string('avatar_url')->nullable();
            $table->timestamps();
        });

        // We don't need password_reset_tokens since Supabase handles auth.
        // We also don't need the default sessions table if we aren't using file/db sessions for API auth,
        // but Laravel might still want it for web routes. We'll leave it out for a pure API setup.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
