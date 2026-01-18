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
        // Add client_id and default_store_id to users table
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->after('id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('default_store_id')->nullable()->after('client_id')->constrained('stores')->onDelete('set null');

            $table->index('client_id');
            $table->index('default_store_id');
        });

        // Add store_id to products table
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
            $table->index('store_id');
        });

        // Add store_id to categories table
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
            $table->index('store_id');
        });

        // Add client_id to customers table
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->after('id')->constrained('clients')->onDelete('cascade');
            $table->index('client_id');
        });

        // Add store_id and merchant_id to transactions table
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
            $table->foreignId('merchant_id')->nullable()->after('store_id')->constrained('payment_merchants')->onDelete('set null');

            $table->index('store_id');
            $table->index('merchant_id');
        });

        // Add store_id to services table
        Schema::table('services', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
            $table->index('store_id');
        });

        // Add store_id to staff table
        Schema::table('staff', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
            $table->index('store_id');
        });

        // Add store_id to appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->onDelete('cascade');
            $table->index('store_id');
        });

        // Add store_id to carts table
        Schema::table('carts', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('cashier_id')->constrained('stores')->onDelete('cascade');
            $table->index('store_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove foreign keys and columns in reverse order
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropForeign(['merchant_id']);
            $table->dropColumn(['store_id', 'merchant_id']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropColumn('client_id');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['default_store_id']);
            $table->dropColumn(['client_id', 'default_store_id']);
        });
    }
};
