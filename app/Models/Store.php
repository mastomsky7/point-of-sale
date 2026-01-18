<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Store extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'client_id',
        'name',
        'code',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'phone',
        'email',
        'manager_user_id',
        'timezone',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the client that owns the store
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the manager user of the store
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_user_id');
    }

    /**
     * Get the active license for the store
     */
    public function license(): HasOne
    {
        return $this->hasOne(StoreLicense::class)->where('status', 'active');
    }

    /**
     * Get all licenses (including inactive)
     */
    public function licenses(): HasMany
    {
        return $this->hasMany(StoreLicense::class);
    }

    /**
     * Get the active merchant mapping
     */
    public function merchantMapping(): HasOne
    {
        return $this->hasOne(StoreMerchantMapping::class)->where('is_active', true);
    }

    /**
     * Get all merchant mappings
     */
    public function merchantMappings(): HasMany
    {
        return $this->hasMany(StoreMerchantMapping::class);
    }

    /**
     * Get the active payment merchant through mapping
     */
    public function merchant(): ?PaymentMerchant
    {
        $mapping = $this->merchantMapping;
        return $mapping ? $mapping->merchant : null;
    }

    /**
     * Get all products in this store
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get all categories in this store
     */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /**
     * Get all services in this store
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Get all staff in this store
     */
    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class);
    }

    /**
     * Get all appointments in this store
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get all transactions in this store
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get all carts in this store
     */
    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * Check if store has an active license
     */
    public function hasActiveLicense(): bool
    {
        $license = $this->license;
        return $license && $license->isActive();
    }

    /**
     * Check if license is expired
     */
    public function isLicenseExpired(): bool
    {
        $license = $this->license;
        return !$license || $license->isExpired();
    }

    /**
     * Get the default merchant or client's default merchant
     */
    public function getDefaultMerchant(): ?PaymentMerchant
    {
        // Try store's mapped merchant first
        $merchant = $this->merchant();

        // Fallback to client's default merchant
        if (!$merchant) {
            $merchant = $this->client->merchants()->where('is_default', true)->first();
        }

        return $merchant;
    }
}
