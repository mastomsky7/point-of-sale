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
        // Add scope to roles table
        Schema::table('roles', function (Blueprint $table) {
            $table->enum('scope', ['global', 'client', 'store'])->default('store')->after('guard_name');
            $table->foreignId('client_id')->nullable()->after('scope')->constrained('clients')->onDelete('cascade');
            $table->foreignId('store_id')->nullable()->after('client_id')->constrained('stores')->onDelete('cascade');
            $table->text('description')->nullable()->after('name');

            $table->index('scope');
            $table->index('client_id');
            $table->index('store_id');
        });

        // Add scope to permissions table
        Schema::table('permissions', function (Blueprint $table) {
            $table->enum('scope', ['global', 'client', 'store'])->default('store')->after('guard_name');
            $table->text('description')->nullable()->after('name');

            $table->index('scope');
        });

        // Add store assignment tracking to model_has_roles
        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->foreignId('assigned_store_id')->nullable()->after('role_id')->constrained('stores')->onDelete('cascade');

            $table->index('assigned_store_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('model_has_roles', function (Blueprint $table) {
            $table->dropForeign(['assigned_store_id']);
            $table->dropIndex(['assigned_store_id']);
            $table->dropColumn('assigned_store_id');
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->dropIndex(['scope']);
            $table->dropColumn(['scope', 'description']);
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['store_id']);
            $table->dropIndex(['scope']);
            $table->dropIndex(['client_id']);
            $table->dropIndex(['store_id']);
            $table->dropColumn(['scope', 'client_id', 'store_id', 'description']);
        });
    }
};
