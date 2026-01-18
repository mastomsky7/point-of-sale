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
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->boolean('whatsapp_enabled')->default(false);
            $table->string('whatsapp_api_url')->nullable();
            $table->string('whatsapp_api_token')->nullable();
            $table->string('whatsapp_phone_number')->nullable();
            $table->string('whatsapp_business_id')->nullable();
            $table->boolean('whatsapp_send_receipt')->default(true);
            $table->boolean('whatsapp_send_appointment')->default(true);
            $table->boolean('whatsapp_send_reminder')->default(false);
            $table->integer('whatsapp_reminder_hours')->default(24); // hours before appointment
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn([
                'whatsapp_enabled',
                'whatsapp_api_url',
                'whatsapp_api_token',
                'whatsapp_phone_number',
                'whatsapp_business_id',
                'whatsapp_send_receipt',
                'whatsapp_send_appointment',
                'whatsapp_send_reminder',
                'whatsapp_reminder_hours',
            ]);
        });
    }
};
