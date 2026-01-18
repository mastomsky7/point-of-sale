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
            // Add service and staff support
            $table->foreignId('service_id')->nullable()->after('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('staff_id')->nullable()->after('service_id')->constrained()->onDelete('set null');
            $table->integer('duration')->nullable()->after('qty')->comment('Service duration in minutes');

            // Make product_id nullable since we now support both products and services
            $table->foreignId('product_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropForeign(['staff_id']);
            $table->dropColumn(['service_id', 'staff_id', 'duration']);
        });
    }
};
