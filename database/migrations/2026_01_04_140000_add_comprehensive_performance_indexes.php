<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * H1: Add comprehensive performance indexes for query optimization
     * Only adds NEW composite indexes that don't already exist from previous migrations
     */
    public function up(): void
    {
        // Helper function to check if index exists
        $indexExists = function (string $table, string $indexName): bool {
            $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
            return count($indexes) > 0;
        };

        // Transactions table - Add only new composite indexes
        if (!$indexExists('transactions', 'idx_transactions_payment_method')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->index('payment_method', 'idx_transactions_payment_method');
            });
        }
        if (!$indexExists('transactions', 'idx_transactions_grand_total')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->index('grand_total', 'idx_transactions_grand_total');
            });
        }

        // Transaction details - Add composite index for transaction + product lookup
        if (!$indexExists('transaction_details', 'idx_trans_details_trans_product')) {
            Schema::table('transaction_details', function (Blueprint $table) {
                $table->index(['transaction_id', 'product_id'], 'idx_trans_details_trans_product');
            });
        }

        // Appointments - Add composite indexes for complex queries
        if (!$indexExists('appointments', 'idx_appointments_customer_date')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->index(['customer_id', 'appointment_date'], 'idx_appointments_customer_date');
            });
        }
        if (!$indexExists('appointments', 'idx_appointments_staff_schedule')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->index(['staff_id', 'appointment_date', 'status'], 'idx_appointments_staff_schedule');
            });
        }
        if (!$indexExists('appointments', 'idx_appointments_payment_status')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->index('payment_status', 'idx_appointments_payment_status');
            });
        }

        // Appointment services - Add composite indexes
        if (!$indexExists('appointment_services', 'idx_appt_services_appt_service')) {
            Schema::table('appointment_services', function (Blueprint $table) {
                $table->index(['appointment_id', 'service_id'], 'idx_appt_services_appt_service');
            });
        }

        // Customers - Add composite indexes for advanced queries
        if (!$indexExists('customers', 'idx_customers_loyalty_spend')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->index(['loyalty_tier', 'total_spend'], 'idx_customers_loyalty_spend');
            });
        }
        if (Schema::hasColumn('customers', 'visit_count') && Schema::hasColumn('customers', 'last_visit_at')) {
            if (!$indexExists('customers', 'idx_customers_activity')) {
                Schema::table('customers', function (Blueprint $table) {
                    $table->index(['visit_count', 'last_visit_at'], 'idx_customers_activity');
                });
            }
        }

        // Products - Add composite indexes (using 'title' not 'name', 'sell_price' not 'price')
        if (!$indexExists('products', 'idx_products_category_title')) {
            Schema::table('products', function (Blueprint $table) {
                $table->index(['category_id', 'title'], 'idx_products_category_title');
            });
        }
        if (!$indexExists('products', 'idx_products_sell_price')) {
            Schema::table('products', function (Blueprint $table) {
                $table->index('sell_price', 'idx_products_sell_price');
            });
        }

        // Services - Add composite indexes (using 'category_id' not 'category')
        if (!$indexExists('services', 'idx_services_category_price')) {
            Schema::table('services', function (Blueprint $table) {
                $table->index(['category_id', 'price'], 'idx_services_category_price');
            });
        }

        // Staff - Add index for active staff
        if (!$indexExists('staff', 'idx_staff_active')) {
            Schema::table('staff', function (Blueprint $table) {
                $table->index('is_active', 'idx_staff_active');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Helper function to drop index if exists
        $dropIfExists = function (string $table, string $indexName): void {
            $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
            if (count($indexes) > 0) {
                Schema::table($table, function (Blueprint $t) use ($indexName) {
                    $t->dropIndex($indexName);
                });
            }
        };

        // Drop all indexes created by this migration
        $dropIfExists('transactions', 'idx_transactions_payment_method');
        $dropIfExists('transactions', 'idx_transactions_grand_total');
        $dropIfExists('transaction_details', 'idx_trans_details_trans_product');
        $dropIfExists('appointments', 'idx_appointments_customer_date');
        $dropIfExists('appointments', 'idx_appointments_staff_schedule');
        $dropIfExists('appointments', 'idx_appointments_payment_status');
        $dropIfExists('appointment_services', 'idx_appt_services_appt_service');
        $dropIfExists('customers', 'idx_customers_loyalty_spend');
        $dropIfExists('customers', 'idx_customers_activity');
        $dropIfExists('products', 'idx_products_category_title');
        $dropIfExists('products', 'idx_products_sell_price');
        $dropIfExists('services', 'idx_services_category_price');
        $dropIfExists('staff', 'idx_staff_active');
    }
};
