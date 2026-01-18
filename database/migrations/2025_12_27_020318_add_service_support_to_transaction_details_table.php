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
        Schema::table('transaction_details', function (Blueprint $table) {
            // Make product_id nullable to support service transactions
            $table->unsignedBigInteger('product_id')->nullable()->change();

            // Add service support columns
            $table->unsignedBigInteger('service_id')->nullable()->after('product_id');
            $table->unsignedBigInteger('staff_id')->nullable()->after('service_id');
            $table->integer('duration')->nullable()->after('staff_id')->comment('Service duration in minutes');

            // Add foreign keys for service and staff
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            $table->foreign('staff_id')->references('id')->on('staff')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_details', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['service_id']);
            $table->dropForeign(['staff_id']);

            // Drop columns
            $table->dropColumn(['service_id', 'staff_id', 'duration']);

            // Make product_id required again
            $table->unsignedBigInteger('product_id')->nullable(false)->change();
        });
    }
};
