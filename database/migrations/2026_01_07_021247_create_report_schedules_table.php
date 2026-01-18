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
        Schema::create('report_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('saved_report_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('type'); // sales, products, customers, profit, tax
            $table->string('frequency'); // daily, weekly, monthly, quarterly, yearly
            $table->string('format'); // pdf, excel, both
            $table->json('filters')->nullable();
            $table->json('recipients'); // array of email addresses
            $table->time('send_at')->default('08:00:00'); // time to send
            $table->integer('day_of_week')->nullable(); // 0-6 for weekly
            $table->integer('day_of_month')->nullable(); // 1-31 for monthly
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamp('next_send_at')->nullable();
            $table->integer('send_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index('next_send_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_schedules');
    }
};
