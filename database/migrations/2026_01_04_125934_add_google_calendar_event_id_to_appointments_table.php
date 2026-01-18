<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * F3: Add Google Calendar event tracking to appointments
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('google_calendar_event_id')->nullable()->after('whatsapp_sent_at');
            $table->timestamp('google_calendar_synced_at')->nullable()->after('google_calendar_event_id');

            $table->index('google_calendar_event_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['google_calendar_event_id']);
            $table->dropColumn([
                'google_calendar_event_id',
                'google_calendar_synced_at',
            ]);
        });
    }
};
