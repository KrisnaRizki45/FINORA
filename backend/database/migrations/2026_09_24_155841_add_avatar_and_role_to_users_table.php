<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'avatar_url')) {
                $table->string('avatar_url')->nullable();
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('user')->index();
            }
        });

        // We can also try to create the Supabase storage bucket here if permissions allow
        try {
            DB::statement("
                INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
                VALUES ('avatars', 'avatars', true, 5242880, '[\"image/png\", \"image/jpeg\", \"image/webp\"]')
                ON CONFLICT (id) DO NOTHING;
            ");

            // RLS for buckets
            DB::statement("
                CREATE POLICY \"Avatar Public Access\" 
                ON storage.objects FOR SELECT 
                USING ( bucket_id = 'avatars' );
            ");
            
            DB::statement("
                CREATE POLICY \"Avatar Insert\" 
                ON storage.objects FOR INSERT 
                WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );
            ");

            DB::statement("
                CREATE POLICY \"Avatar Update\" 
                ON storage.objects FOR UPDATE 
                WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );
            ");

            DB::statement("
                CREATE POLICY \"Avatar Delete\" 
                ON storage.objects FOR DELETE 
                USING ( bucket_id = 'avatars' AND auth.uid() = owner );
            ");

        } catch (\Exception $e) {
            // Ignore if policies already exist or permission denied
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_url', 'role']);
        });

        try {
            DB::statement("DROP POLICY IF EXISTS \"Avatar Public Access\" ON storage.objects;");
            DB::statement("DROP POLICY IF EXISTS \"Avatar Insert\" ON storage.objects;");
            DB::statement("DROP POLICY IF EXISTS \"Avatar Update\" ON storage.objects;");
            DB::statement("DROP POLICY IF EXISTS \"Avatar Delete\" ON storage.objects;");
        } catch (\Exception $e) {
        }
    }
};
