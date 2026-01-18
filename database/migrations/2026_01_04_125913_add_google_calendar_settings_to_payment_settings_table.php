<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * F3: Add Google Calendar sync settings to payment_settings table
     */
    public function up(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            // Google Calendar OAuth settings
            $table->boolean('google_calendar_enabled')->default(false)->after('sms_send_reminder');
            $table->string('google_calendar_client_id')->nullable()->after('google_calendar_enabled');
            $table->text('google_calendar_client_secret')->nullable()->after('google_calendar_client_id');
            $table->text('google_calendar_refresh_token')->nullable()->after('google_calendar_client_secret');
            $table->string('google_calendar_id')->nullable()->after('google_calendar_refresh_token'); // Calendar ID to use (e.g., primary)

            // Sync preferences
            $table->boolean('google_calendar_auto_sync')->default(true)->after('google_calendar_id');
            $table->boolean('google_calendar_send_notifications')->default(true)->after('google_calendar_auto_sync');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn([
                'google_calendar_enabled',
                'google_calendar_client_id',
                'google_calendar_client_secret',
                'google_calendar_refresh_token',
                'google_calendar_id',
                'google_calendar_auto_sync',
                'google_calendar_send_notifications',
            ]);
        });
    }
};
