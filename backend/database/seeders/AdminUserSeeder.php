<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Str;
use Supabase\SupabaseClient;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL', 'admin@finora.com');
        $adminPassword = env('ADMIN_PASSWORD', 'change-this-password');
        $supabaseUrl = env('SUPABASE_URL');
        $supabaseKey = env('SUPABASE_SERVICE_ROLE_KEY');

        if (!$supabaseUrl || !$supabaseKey) {
            $this->command->error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
            return;
        }

        // We use curl directly to interact with Supabase Auth admin API to create the user if not exists
        $url = $supabaseUrl . '/auth/v1/admin/users';
        
        // 1. Check if user exists
        // There is no easy search by email in standard GoTrue admin API without listing all users
        // Let's just try to create the user, and if it fails because it exists, we catch it.
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . $supabaseKey,
            'Authorization: Bearer ' . $supabaseKey,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'email' => $adminEmail,
            'password' => $adminPassword,
            'email_confirm' => true,
            'user_metadata' => ['name' => 'System Admin']
        ]));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode($response, true);
        
        $userId = null;
        if ($httpCode >= 200 && $httpCode < 300) {
            $userId = $data['id'];
            $this->command->info('Created admin user in Supabase Auth.');
        } else {
            // Probably already exists
            $this->command->info('Failed to create in Supabase Auth (likely already exists). Trying to find local user.');
        }

        // 2. Upsert in local database
        $admin = User::where('email', $adminEmail)->first();
        if ($admin) {
            $admin->update(['role' => 'admin']);
            $this->command->info("Updated existing user {$adminEmail} to admin role.");
        } else if ($userId) {
            User::create([
                'id' => $userId,
                'email' => $adminEmail,
                'name' => 'System Admin',
                'role' => 'admin'
            ]);
            $this->command->info("Created local admin user record.");
        } else {
            $this->command->error("Could not create local user because Supabase user creation failed and local user not found.");
        }
    }
}
