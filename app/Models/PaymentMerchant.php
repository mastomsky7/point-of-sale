<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMerchant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'client_id',
        'name',
        'merchant_code',
        'description',
        'midtrans_enabled',
        'midtrans_merchant_id',
        'midtrans_server_key',
        'midtrans_client_key',
        'midtrans_is_production',
        'xendit_enabled',
        'xendit_api_key',
        'xendit_webhook_token',
        'xendit_public_key',
        'xendit_is_production',
        'bank_accounts',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'midtrans_enabled' => 'boolean',
        'midtrans_is_production' => 'boolean',
        'xendit_enabled' => 'boolean',
        'xendit_is_production' => 'boolean',
        'bank_accounts' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function storeMappings(): HasMany
    {
        return $this->hasMany(StoreMerchantMapping::class, 'merchant_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'merchant_id');
    }

    public function midtransConfig(): array
    {
        return [
            'enabled' => $this->midtrans_enabled && filled($this->midtrans_server_key),
            'merchant_id' => $this->midtrans_merchant_id,
            'server_key' => $this->midtrans_server_key,
            'client_key' => $this->midtrans_client_key,
            'is_production' => $this->midtrans_is_production,
        ];
    }

    public function xenditConfig(): array
    {
        return [
            'enabled' => $this->xendit_enabled && filled($this->xendit_api_key),
            'api_key' => $this->xendit_api_key,
            'webhook_token' => $this->xendit_webhook_token,
            'public_key' => $this->xendit_public_key,
            'is_production' => $this->xendit_is_production,
        ];
    }

    public function isMidtransReady(): bool
    {
        return $this->midtrans_enabled
            && filled($this->midtrans_server_key)
            && filled($this->midtrans_client_key);
    }

    public function isXenditReady(): bool
    {
        return $this->xendit_enabled && filled($this->xendit_api_key);
    }
}
