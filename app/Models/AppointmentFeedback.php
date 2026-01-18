<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentFeedback extends Model
{
    protected $table = 'appointment_feedbacks';

    protected $fillable = [
        'appointment_id',
        'customer_id',
        'staff_id',
        'overall_rating',
        'service_quality',
        'staff_rating',
        'cleanliness_rating',
        'value_rating',
        'comment',
        'improvements',
        'would_recommend',
    ];

    protected $casts = [
        'would_recommend' => 'boolean',
        'overall_rating' => 'integer',
        'service_quality' => 'integer',
        'staff_rating' => 'integer',
        'cleanliness_rating' => 'integer',
        'value_rating' => 'integer',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Get average of all rating categories
     */
    public function getAverageRatingAttribute(): float
    {
        $ratings = array_filter([
            $this->service_quality,
            $this->staff_rating,
            $this->cleanliness_rating,
            $this->value_rating,
        ]);

        if (empty($ratings)) {
            return $this->overall_rating;
        }

        return round(array_sum($ratings) / count($ratings), 1);
    }
}
