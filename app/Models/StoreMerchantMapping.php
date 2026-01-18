<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreMerchantMapping extends Model
{
    protected $fillable = [
        'store_id',
        'merchant_id',
        'is_active',
        'activated_at',
        'deactivated_at',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'activated_at' => 'datetime',
        'deactivated_at' => 'datetime',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(PaymentMerchant::class, 'merchant_id');
    }

    /**
     * Activate this mapping and deactivate others for this store
     */
    public function activate(): void
    {
        // Deactivate all other mappings for this store
        self::where('store_id', $this->store_id)
            ->where('id', '!=', $this->id)
            ->update([
                'is_active' => false,
                'deactivated_at' => now(),
            ]);

        // Activate this mapping
        $this->update([
            'is_active' => true,
            'activated_at' => now(),
            'deactivated_at' => null,
        ]);
    }

    /**
     * Deactivate this mapping
     */
    public function deactivate(): void
    {
        $this->update([
            'is_active' => false,
            'deactivated_at' => now(),
        ]);
    }
}
