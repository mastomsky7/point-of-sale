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
        Schema::table('appointments', function (Blueprint $table) {
            // D2: Reminder tracking fields
            $table->boolean('reminder_24h_sent')->default(false)->after('whatsapp_sent_at');
            $table->timestamp('reminder_24h_sent_at')->nullable()->after('reminder_24h_sent');
            $table->boolean('reminder_1h_sent')->default(false)->after('reminder_24h_sent_at');
            $table->timestamp('reminder_1h_sent_at')->nullable()->after('reminder_1h_sent');

            // Index for efficient reminder queries
            $table->index(['appointment_date', 'reminder_24h_sent', 'status']);
            $table->index(['appointment_date', 'reminder_1h_sent', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['appointment_date', 'reminder_24h_sent', 'status']);
            $table->dropIndex(['appointment_date', 'reminder_1h_sent', 'status']);

            $table->dropColumn([
                'reminder_24h_sent',
                'reminder_24h_sent_at',
                'reminder_1h_sent',
                'reminder_1h_sent_at',
            ]);
        });
    }
};
