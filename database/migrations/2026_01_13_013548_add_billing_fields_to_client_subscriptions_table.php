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
        Schema::table('client_subscriptions', function (Blueprint $table) {
            $table->timestamp('current_period_start')->nullable()->after('ends_at');
            $table->timestamp('current_period_end')->nullable()->after('current_period_start');
            $table->timestamp('next_billing_date')->nullable()->after('current_period_end');
            $table->timestamp('last_billing_attempt')->nullable()->after('next_billing_date');
            $table->integer('billing_failure_count')->default(0)->after('last_billing_attempt');
            $table->string('payment_method')->nullable()->after('billing_failure_count');
            $table->json('billing_metadata')->nullable()->after('payment_method');

            // Indexes for performance
            $table->index('next_billing_date');
            $table->index(['status', 'next_billing_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('client_subscriptions', function (Blueprint $table) {
            $table->dropIndex(['next_billing_date']);
            $table->dropIndex(['status', 'next_billing_date']);

            $table->dropColumn([
                'current_period_start',
                'current_period_end',
                'next_billing_date',
                'last_billing_attempt',
                'billing_failure_count',
                'payment_method',
                'billing_metadata',
            ]);
        });
    }
};
