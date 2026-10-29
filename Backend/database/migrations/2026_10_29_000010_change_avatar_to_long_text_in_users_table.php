<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            DB::statement('ALTER TABLE users ALTER COLUMN avatar TYPE TEXT;');
        } catch (\Throwable $e) {
            // Fallback for MySQL if needed
            try {
                DB::statement('ALTER TABLE users MODIFY avatar LONGTEXT;');
            } catch (\Throwable $ex) {
                // Ignore if already text
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement('ALTER TABLE users ALTER COLUMN avatar TYPE VARCHAR(255);');
        } catch (\Throwable $e) {
            // Ignore
        }
    }
};

