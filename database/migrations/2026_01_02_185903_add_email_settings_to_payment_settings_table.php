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
            // Email Configuration
            $table->boolean('email_enabled')->default(false)->after('whatsapp_business_id');
            $table->string('email_driver')->default('smtp')->after('email_enabled');
            $table->string('email_host')->nullable()->after('email_driver');
            $table->integer('email_port')->default(587)->after('email_host');
            $table->string('email_username')->nullable()->after('email_port');
            $table->string('email_password')->nullable()->after('email_username');
            $table->string('email_encryption')->default('tls')->after('email_password');
            $table->string('email_from_address')->nullable()->after('email_encryption');
            $table->string('email_from_name')->nullable()->after('email_from_address');
            $table->boolean('email_send_receipt')->default(true)->after('email_from_name');
            $table->text('email_receipt_message')->nullable()->after('email_send_receipt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn([
                'email_enabled',
                'email_driver',
                'email_host',
                'email_port',
                'email_username',
                'email_password',
                'email_encryption',
                'email_from_address',
                'email_from_name',
                'email_send_receipt',
                'email_receipt_message'
            ]);
        });
    }
};
