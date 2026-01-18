<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * F2: Add SMS integration settings to payment_settings table
     */
    public function up(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            // SMS Provider settings (Twilio, Vonage/Nexmo, or local Indonesian gateway)
            $table->boolean('sms_enabled')->default(false)->after('email_receipt_message');
            $table->string('sms_provider')->nullable()->after('sms_enabled'); // twilio, vonage, zenziva, etc.

            // Twilio settings
            $table->string('sms_twilio_sid')->nullable()->after('sms_provider');
            $table->string('sms_twilio_token')->nullable()->after('sms_twilio_sid');
            $table->string('sms_twilio_from')->nullable()->after('sms_twilio_token');

            // Vonage/Nexmo settings
            $table->string('sms_vonage_key')->nullable()->after('sms_twilio_from');
            $table->string('sms_vonage_secret')->nullable()->after('sms_vonage_key');
            $table->string('sms_vonage_from')->nullable()->after('sms_vonage_secret');

            // Indonesian local gateway (Zenziva, etc.)
            $table->string('sms_zenziva_userkey')->nullable()->after('sms_vonage_from');
            $table->string('sms_zenziva_passkey')->nullable()->after('sms_zenziva_userkey');

            // Generic SMS gateway settings (for custom providers)
            $table->string('sms_custom_api_url')->nullable()->after('sms_zenziva_passkey');
            $table->string('sms_custom_api_key')->nullable()->after('sms_custom_api_url');
            $table->string('sms_custom_sender_id')->nullable()->after('sms_custom_api_key');

            // SMS notification preferences
            $table->boolean('sms_send_receipt')->default(false)->after('sms_custom_sender_id');
            $table->boolean('sms_send_appointment')->default(false)->after('sms_send_receipt');
            $table->boolean('sms_send_reminder')->default(false)->after('sms_send_appointment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn([
                'sms_enabled',
                'sms_provider',
                'sms_twilio_sid',
                'sms_twilio_token',
                'sms_twilio_from',
                'sms_vonage_key',
                'sms_vonage_secret',
                'sms_vonage_from',
                'sms_zenziva_userkey',
                'sms_zenziva_passkey',
                'sms_custom_api_url',
                'sms_custom_api_key',
                'sms_custom_sender_id',
                'sms_send_receipt',
                'sms_send_appointment',
                'sms_send_reminder',
            ]);
        });
    }
};
