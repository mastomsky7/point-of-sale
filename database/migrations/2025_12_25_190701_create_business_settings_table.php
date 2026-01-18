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
        Schema::create('business_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('business_type', ['retail', 'beauty_salon', 'bar'])->default('retail');
            $table->string('business_name');
            $table->string('business_phone')->nullable();
            $table->string('business_email')->nullable();
            $table->text('business_address')->nullable();
            $table->string('business_logo')->nullable();
            $table->string('currency', 10)->default('IDR');
            $table->string('timezone')->default('Asia/Jakarta');
            $table->boolean('enable_appointments')->default(false);
            $table->boolean('enable_tables')->default(false);
            $table->integer('appointment_slot_duration')->default(30); // minutes
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();
            $table->json('working_days')->nullable(); // [1,2,3,4,5] = Monday-Friday
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_settings');
    }
};
