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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('tier', ['basic', 'pro', 'enterprise'])->default('basic');
            $table->decimal('price', 15, 2)->default(0);
            $table->string('currency', 10)->default('IDR');
            $table->enum('billing_interval', ['monthly', 'quarterly', 'yearly'])->default('monthly');
            $table->integer('trial_days')->default(14);

            // Limits
            $table->integer('max_stores')->default(1);
            $table->integer('max_products')->nullable();
            $table->integer('max_users')->nullable();
            $table->integer('max_transactions_per_month')->nullable();

            // Features
            $table->json('features')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('slug');
            $table->index('tier');
            $table->index(['is_active', 'is_public']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
