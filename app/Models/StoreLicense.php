<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class StoreLicense extends Model
{
    protected $fillable = [
        'store_id',
        'plan_id',
        'license_key',
        'status',
        'activated_at',
        'expires_at',
        'grace_period_ends_at',
        'auto_renew',
        'features',
        'limits',
    ];

    protected $casts = [
        'activated_at' => 'datetime',
        'expires_at' => 'datetime',
        'grace_period_ends_at' => 'datetime',
        'auto_renew' => 'boolean',
        'features' => 'array',
        'limits' => 'array',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && !$this->isExpired();
    }

    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false;
        }
        return $this->expires_at->isPast();
    }

    public function isInGracePeriod(): bool
    {
        if (!$this->grace_period_ends_at) {
            return false;
        }
        return $this->isExpired() && $this->grace_period_ends_at->isFuture();
    }

    public function daysUntilExpiry(): ?int
    {
        if (!$this->expires_at) {
            return null;
        }
        return Carbon::now()->diffInDays($this->expires_at, false);
    }

    public function daysUntilGracePeriodExpiry(): ?int
    {
        if (!$this->grace_period_ends_at) {
            return null;
        }
        return Carbon::now()->diffInDays($this->grace_period_ends_at, false);
    }
}
