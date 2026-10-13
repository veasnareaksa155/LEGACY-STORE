<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Resilient Database Fallback: If external PostgreSQL (e.g. Supabase) is down or unreachable, fallback to local SQLite
        try {
            \Illuminate\Support\Facades\DB::connection()->getPdo();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Primary DB unreachable, falling back to local SQLite: ' . $e->getMessage());
            \Illuminate\Support\Facades\DB::purge();
            \Illuminate\Support\Facades\Config::set('database.connections.sqlite.database', database_path('database.sqlite'));
            \Illuminate\Support\Facades\Config::set('database.default', 'sqlite');
            \Illuminate\Support\Facades\DB::reconnect();
        }
    }
}