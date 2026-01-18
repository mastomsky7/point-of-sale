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
            // Change string columns to text for unlimited length
            $table->text('whatsapp_api_url')->nullable()->change();
            $table->text('whatsapp_api_token')->nullable()->change();

            // Also increase other WhatsApp fields that might be too small
            $table->string('whatsapp_phone_number', 50)->nullable()->change();
            $table->string('whatsapp_business_id', 100)->nullable()->change();

            // Increase payment gateway fields as well (might have long tokens)
            $table->text('midtrans_server_key')->nullable()->change();
            $table->text('midtrans_client_key')->nullable()->change();
            $table->text('xendit_secret_key')->nullable()->change();
            $table->text('xendit_public_key')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            // Revert to original varchar(255)
            $table->string('whatsapp_api_url')->nullable()->change();
            $table->string('whatsapp_api_token')->nullable()->change();
            $table->string('whatsapp_phone_number', 20)->nullable()->change();
            $table->string('whatsapp_business_id', 100)->nullable()->change();

            $table->string('midtrans_server_key')->nullable()->change();
            $table->string('midtrans_client_key')->nullable()->change();
            $table->string('xendit_secret_key')->nullable()->change();
            $table->string('xendit_public_key')->nullable()->change();
        });
    }
};
