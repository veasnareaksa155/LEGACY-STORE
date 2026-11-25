<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed SuperAdmin Users
        User::updateOrCreate(
            ['email' => 'admin@alexandreluxe.com'],
            [
                'name' => 'SuperAdmin Alexandre',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@legacystore.com'],
            [
                'name' => 'SuperAdmin Legacy',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // Seed Delivery Driver 1 (Sokha Express)
        User::updateOrCreate(
            ['email' => 'driver@alexandreluxe.com'],
            [
                'name' => 'Sokha Express Courier',
                'password' => Hash::make('driver123'),
                'phone' => '+855 12 888 999',
                'role' => 'driver',
                'vehicle_tag' => 'PP-9921',
            ]
        );

        // Seed Delivery Driver 2 (Vibol Logistics)
        User::updateOrCreate(
            ['email' => 'vibol@alexandreluxe.com'],
            [
                'name' => 'Vibol Logistics Express',
                'password' => Hash::make('driver123'),
                'phone' => '+855 12 777 666',
                'role' => 'driver',
                'vehicle_tag' => 'PP-7712',
            ]
        );

        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
            ReviewSeeder::class,
        ]);
    }
}