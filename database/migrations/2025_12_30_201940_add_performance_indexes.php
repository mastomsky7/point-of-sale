<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Helper function to check if index exists
        $indexExists = function (string $table, string $indexName): bool {
            $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = '{$indexName}'");
            return count($indexes) > 0;
        };

        // Transactions table - Most queried table
        if (!$indexExists('transactions', 'transactions_invoice_index')) {
            DB::statement('ALTER TABLE transactions ADD INDEX transactions_invoice_index (invoice)');
        }
        if (!$indexExists('transactions', 'transactions_cashier_id_index')) {
            DB::statement('ALTER TABLE transactions ADD INDEX transactions_cashier_id_index (cashier_id)');
        }
        if (!$indexExists('transactions', 'transactions_customer_id_index')) {
            DB::statement('ALTER TABLE transactions ADD INDEX transactions_customer_id_index (customer_id)');
        }
        if (!$indexExists('transactions', 'transactions_payment_status_index')) {
            DB::statement('ALTER TABLE transactions ADD INDEX transactions_payment_status_index (payment_status)');
        }
        if (!$indexExists('transactions', 'transactions_created_at_index')) {
            DB::statement('ALTER TABLE transactions ADD INDEX transactions_created_at_index (created_at)');
        }

        // Transaction details
        if (!$indexExists('transaction_details', 'transaction_details_transaction_id_index')) {
            DB::statement('ALTER TABLE transaction_details ADD INDEX transaction_details_transaction_id_index (transaction_id)');
        }
        if (!$indexExists('transaction_details', 'transaction_details_product_id_index')) {
            DB::statement('ALTER TABLE transaction_details ADD INDEX transaction_details_product_id_index (product_id)');
        }
        if (Schema::hasColumn('transaction_details', 'service_id')) {
            if (!$indexExists('transaction_details', 'transaction_details_service_id_index')) {
                DB::statement('ALTER TABLE transaction_details ADD INDEX transaction_details_service_id_index (service_id)');
            }
        }

        // Products - POS queries
        if (!$indexExists('products', 'products_barcode_index')) {
            DB::statement('ALTER TABLE products ADD INDEX products_barcode_index (barcode)');
        }
        if (!$indexExists('products', 'products_category_id_index')) {
            DB::statement('ALTER TABLE products ADD INDEX products_category_id_index (category_id)');
        }
        if (!$indexExists('products', 'products_stock_index')) {
            DB::statement('ALTER TABLE products ADD INDEX products_stock_index (stock)');
        }

        // Services
        if (Schema::hasTable('services')) {
            if (!$indexExists('services', 'services_is_active_index')) {
                DB::statement('ALTER TABLE services ADD INDEX services_is_active_index (is_active)');
            }
            if (Schema::hasColumn('services', 'category_id')) {
                if (!$indexExists('services', 'services_category_id_index')) {
                    DB::statement('ALTER TABLE services ADD INDEX services_category_id_index (category_id)');
                }
            }
        }

        // Customers
        if (Schema::hasColumn('customers', 'phone')) {
            if (!$indexExists('customers', 'customers_phone_index')) {
                DB::statement('ALTER TABLE customers ADD INDEX customers_phone_index (phone)');
            }
        }

        // Carts - POS real-time queries
        if (!$indexExists('carts', 'carts_cashier_id_index')) {
            DB::statement('ALTER TABLE carts ADD INDEX carts_cashier_id_index (cashier_id)');
        }
        if (Schema::hasColumn('carts', 'hold_id')) {
            if (!$indexExists('carts', 'carts_hold_id_index')) {
                DB::statement('ALTER TABLE carts ADD INDEX carts_hold_id_index (hold_id)');
            }
        }

        // Appointments
        if (Schema::hasTable('appointments')) {
            if (!$indexExists('appointments', 'appointments_customer_id_index')) {
                DB::statement('ALTER TABLE appointments ADD INDEX appointments_customer_id_index (customer_id)');
            }
            if (!$indexExists('appointments', 'appointments_status_index')) {
                DB::statement('ALTER TABLE appointments ADD INDEX appointments_status_index (status)');
            }
            if (Schema::hasColumn('appointments', 'appointment_date')) {
                if (!$indexExists('appointments', 'appointments_appointment_date_index')) {
                    DB::statement('ALTER TABLE appointments ADD INDEX appointments_appointment_date_index (appointment_date)');
                }
            }
        }

        // Profits
        if (Schema::hasTable('profits')) {
            if (!$indexExists('profits', 'profits_transaction_id_index')) {
                DB::statement('ALTER TABLE profits ADD INDEX profits_transaction_id_index (transaction_id)');
            }
            if (!$indexExists('profits', 'profits_created_at_index')) {
                DB::statement('ALTER TABLE profits ADD INDEX profits_created_at_index (created_at)');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes (optional - indexes don't affect data)
        $dropIfExists = function (string $table, string $indexName): void {
            $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = '{$indexName}'");
            if (count($indexes) > 0) {
                DB::statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
            }
        };

        $dropIfExists('transactions', 'transactions_invoice_index');
        $dropIfExists('transactions', 'transactions_cashier_id_index');
        $dropIfExists('transactions', 'transactions_customer_id_index');
        $dropIfExists('transactions', 'transactions_payment_status_index');
        $dropIfExists('transactions', 'transactions_created_at_index');

        $dropIfExists('transaction_details', 'transaction_details_transaction_id_index');
        $dropIfExists('transaction_details', 'transaction_details_product_id_index');
        $dropIfExists('transaction_details', 'transaction_details_service_id_index');

        $dropIfExists('products', 'products_barcode_index');
        $dropIfExists('products', 'products_category_id_index');
        $dropIfExists('products', 'products_stock_index');

        if (Schema::hasTable('services')) {
            $dropIfExists('services', 'services_is_active_index');
            $dropIfExists('services', 'services_category_id_index');
        }

        if (Schema::hasTable('customers')) {
            $dropIfExists('customers', 'customers_phone_index');
        }

        $dropIfExists('carts', 'carts_cashier_id_index');
        $dropIfExists('carts', 'carts_hold_id_index');

        if (Schema::hasTable('appointments')) {
            $dropIfExists('appointments', 'appointments_customer_id_index');
            $dropIfExists('appointments', 'appointments_status_index');
            $dropIfExists('appointments', 'appointments_appointment_date_index');
        }

        if (Schema::hasTable('profits')) {
            $dropIfExists('profits', 'profits_transaction_id_index');
            $dropIfExists('profits', 'profits_created_at_index');
        }
    }
};
