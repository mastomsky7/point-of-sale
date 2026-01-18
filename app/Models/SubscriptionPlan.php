<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'tier',
        'price',
        'currency',
        'billing_interval',
        'trial_days',
        'max_stores',
        'max_merchants',
        'max_products',
        'max_users',
        'max_transactions_per_month',
        'features',
        'is_active',
        'is_public',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'trial_days' => 'integer',
        'max_stores' => 'integer',
        'max_merchants' => 'integer',
        'max_products' => 'integer',
        'max_users' => 'integer',
        'max_transactions_per_month' => 'integer',
        'features' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function clientSubscriptions(): HasMany
    {
        return $this->hasMany(ClientSubscription::class, 'plan_id');
    }

    public function storeLicenses(): HasMany
    {
        return $this->hasMany(StoreLicense::class, 'plan_id');
    }

    public function hasFeature(string $feature): bool
    {
        $features = $this->features ?? [];
        return isset($features[$feature]) && $features[$feature] === true;
    }

    public function allowsMultiMerchant(): bool
    {
        return $this->max_merchants > 1 || $this->max_merchants === null || $this->max_merchants >= 999999;
    }

    public function canAddMerchant(int $currentMerchantCount): bool
    {
        if ($this->max_merchants === null || $this->max_merchants >= 999999) {
            return true; // Unlimited
        }
        return $currentMerchantCount < $this->max_merchants;
    }

    public function canAddStore(int $currentStoreCount): bool
    {
        if ($this->max_stores === null || $this->max_stores >= 999999) {
            return true; // Unlimited
        }
        return $currentStoreCount < $this->max_stores;
    }

    public function getFormattedPriceAttribute(): string
    {
        if ($this->currency === 'IDR') {
            return 'Rp ' . number_format($this->price, 0, ',', '.');
        }
        return $this->currency . ' ' . number_format($this->price, 2);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true)->where('is_active', true);
    }
}
