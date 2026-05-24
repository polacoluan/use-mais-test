<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UseMaisRhUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'usemaisrh@example.com'],
            [
                'name' => 'Use Mais RH',
                'password' => Hash::make('usemaisrh123'),
                'email_verified_at' => now(),
            ],
        );
    }
}
