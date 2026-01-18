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
        Schema::table('carts', function (Blueprint $table) {
            // Composite index for common query: WHERE cashier_id = ? AND hold_id IS NULL
            $table->index(['cashier_id', 'hold_id'], 'idx_cashier_hold');

            // Index for product lookup in cart
            $table->index(['cashier_id', 'product_id', 'hold_id'], 'idx_cashier_product_hold');

            // Index for service lookup in cart
            $table->index(['cashier_id', 'service_id', 'staff_id', 'hold_id'], 'idx_cashier_service_staff_hold');

            // Index for held carts queries
            $table->index('hold_id', 'idx_hold_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex('idx_cashier_hold');
            $table->dropIndex('idx_cashier_product_hold');
            $table->dropIndex('idx_cashier_service_staff_hold');
            $table->dropIndex('idx_hold_id');
        });
    }
};
