<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ReportSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'saved_report_id',
        'name',
        'type',
        'frequency',
        'format',
        'filters',
        'recipients',
        'send_at',
        'day_of_week',
        'day_of_month',
        'is_active',
        'last_sent_at',
        'next_send_at',
        'send_count',
    ];

    protected $casts = [
        'filters' => 'array',
        'recipients' => 'array',
        'is_active' => 'boolean',
        'last_sent_at' => 'datetime',
        'next_send_at' => 'datetime',
    ];

    /**
     * Get the user that owns the schedule
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the saved report
     */
    public function savedReport(): BelongsTo
    {
        return $this->belongsTo(SavedReport::class);
    }

    /**
     * Calculate next send time
     */
    public function calculateNextSendTime(): Carbon
    {
        $now = now();
        $time = Carbon::parse($this->send_at);

        switch ($this->frequency) {
            case 'daily':
                $next = $now->copy()->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addDay();
                }
                break;

            case 'weekly':
                $next = $now->copy()->next($this->day_of_week)->setTime($time->hour, $time->minute);
                break;

            case 'monthly':
                $next = $now->copy()->day($this->day_of_month)->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addMonth();
                }
                break;

            case 'quarterly':
                $next = $now->copy()->day($this->day_of_month)->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addMonths(3);
                }
                break;

            case 'yearly':
                $next = $now->copy()->month(1)->day($this->day_of_month)->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addYear();
                }
                break;

            default:
                $next = $now->addDay();
        }

        return $next;
    }

    /**
     * Mark as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'last_sent_at' => now(),
            'next_send_at' => $this->calculateNextSendTime(),
            'send_count' => $this->send_count + 1,
        ]);
    }

    /**
     * Scope for active schedules
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for due schedules
     */
    public function scopeDue($query)
    {
        return $query->where('next_send_at', '<=', now());
    }
}
