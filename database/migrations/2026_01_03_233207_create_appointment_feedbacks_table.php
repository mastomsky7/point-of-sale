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
        Schema::create('appointment_feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('staff_id')->nullable()->constrained('staff')->onDelete('set null');

            // E3: Rating fields (1-5 stars)
            $table->tinyInteger('overall_rating')->unsigned(); // Overall experience
            $table->tinyInteger('service_quality')->unsigned()->nullable(); // Service quality
            $table->tinyInteger('staff_rating')->unsigned()->nullable(); // Staff performance
            $table->tinyInteger('cleanliness_rating')->unsigned()->nullable(); // Cleanliness
            $table->tinyInteger('value_rating')->unsigned()->nullable(); // Value for money

            // Feedback text
            $table->text('comment')->nullable();
            $table->text('improvements')->nullable(); // What can be improved

            // Recommendation
            $table->boolean('would_recommend')->default(true);

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index('appointment_id');
            $table->index('customer_id');
            $table->index('overall_rating');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_feedbacks');
    }
};
