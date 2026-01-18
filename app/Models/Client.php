<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Client extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'owner_user_id',
        'company_name',
        'company_registration',
        'tax_id',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'phone',
        'email',
        'website',
        'logo',
        'timezone',
        'locale',
        'currency',
        'status',
        'trial_ends_at',
        'suspended_at',
        'suspension_reason',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'suspended_at' => 'datetime',
    ];

    /**
     * Get the owner user of the client
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    /**
     * Get all stores belonging to the client
     */
    public function stores(): HasMany
    {
        return $this->hasMany(Store::class);
    }

    /**
     * Get all users belonging to the client
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all customers belonging to the client
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    /**
     * Get all merchants belonging to the client
     */
    public function merchants(): HasMany
    {
        return $this->hasMany(PaymentMerchant::class);
    }

    /**
     * Get the active subscription for the client
     */
    public function subscription(): HasOne
    {
        return $this->hasOne(ClientSubscription::class)->where('status', 'active');
    }

    /**
     * Get all subscriptions (including inactive)
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(ClientSubscription::class);
    }

    /**
     * Check if client is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if client is on trial
     */
    public function isTrialing(): bool
    {
        return $this->status === 'trial' && $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Check if client is suspended
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }
}
