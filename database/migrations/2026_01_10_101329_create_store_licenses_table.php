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
        Schema::create('store_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('subscription_plans')->onDelete('restrict');
            $table->string('license_key')->unique();
            $table->enum('status', ['active', 'expired', 'suspended', 'cancelled'])->default('active');
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('grace_period_ends_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->json('features')->nullable();
            $table->json('limits')->nullable();
            $table->timestamps();

            $table->index('store_id');
            $table->index('status');
            $table->index('expires_at');
            $table->index('license_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_licenses');
    }
};
