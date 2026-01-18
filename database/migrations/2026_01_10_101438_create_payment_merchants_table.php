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
        Schema::create('payment_merchants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->string('name');
            $table->string('merchant_code', 100);
            $table->text('description')->nullable();

            // Midtrans credentials (per merchant)
            $table->boolean('midtrans_enabled')->default(false);
            $table->string('midtrans_merchant_id')->nullable();
            $table->text('midtrans_server_key')->nullable();
            $table->text('midtrans_client_key')->nullable();
            $table->boolean('midtrans_is_production')->default(false);

            // Xendit credentials (per merchant)
            $table->boolean('xendit_enabled')->default(false);
            $table->text('xendit_api_key')->nullable();
            $table->text('xendit_webhook_token')->nullable();
            $table->text('xendit_public_key')->nullable();
            $table->boolean('xendit_is_production')->default(false);

            // Bank accounts for settlement
            $table->json('bank_accounts')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['client_id', 'merchant_code'], 'unique_merchant_code');
            $table->index('client_id');
            $table->index('is_active');
            $table->index(['client_id', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_merchants');
    }
};
