<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * E4: Add loyalty program fields to customers table
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Loyalty points
            $table->integer('loyalty_points')->default(0)->after('address');
            $table->integer('total_points_earned')->default(0)->after('loyalty_points');
            $table->integer('total_points_redeemed')->default(0)->after('total_points_earned');

            // Customer tier (bronze, silver, gold, platinum)
            $table->string('loyalty_tier')->default('bronze')->after('total_points_redeemed');

            // Total spend tracking
            $table->decimal('total_spend', 15, 2)->default(0)->after('loyalty_tier');
            $table->integer('visit_count')->default(0)->after('total_spend');

            // Timestamps
            $table->timestamp('first_visit_at')->nullable()->after('visit_count');
            $table->timestamp('last_visit_at')->nullable()->after('first_visit_at');

            // Indexes for performance
            $table->index('loyalty_tier');
            $table->index('loyalty_points');
            $table->index('total_spend');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['loyalty_tier']);
            $table->dropIndex(['loyalty_points']);
            $table->dropIndex(['total_spend']);

            $table->dropColumn([
                'loyalty_points',
                'total_points_earned',
                'total_points_redeemed',
                'loyalty_tier',
                'total_spend',
                'visit_count',
                'first_visit_at',
                'last_visit_at',
            ]);
        });
    }
};
