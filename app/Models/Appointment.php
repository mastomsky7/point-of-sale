<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Scopes\StoreScopeTrait;

class Appointment extends Model
{
    use SoftDeletes, StoreScopeTrait;

    protected $fillable = [
        'appointment_number',
        'customer_id',
        'staff_id',
        'created_by',
        'appointment_date',
        'duration',
        'status',
        'notes',
        'total_price',
        'deposit',
        'payment_status',
        'transaction_id',
        'confirmed_at',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
        'whatsapp_sent',
        'whatsapp_sent_at',
        'google_calendar_event_id', // F3
        'google_calendar_synced_at', // F3
    ];

    protected $casts = [
        'appointment_date' => 'datetime',
        'total_price' => 'decimal:2',
        'deposit' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'whatsapp_sent' => 'boolean',
        'whatsapp_sent_at' => 'datetime',
        'google_calendar_synced_at' => 'datetime', // F3
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function appointmentServices(): HasMany
    {
        return $this->hasMany(AppointmentService::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'appointment_services')
            ->withPivot('staff_id', 'price', 'duration')
            ->withTimestamps();
    }

    // E3: Feedback relationship
    public function feedback(): HasOne
    {
        return $this->hasOne(AppointmentFeedback::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($appointment) {
            if (!$appointment->appointment_number) {
                $appointment->appointment_number = 'APT-' . strtoupper(uniqid());
            }
        });
    }
}
