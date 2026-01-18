<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChartOfAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'code',
        'name',
        'type',
        'parent_id',
        'description',
        'is_active',
        'balance',
        'currency',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'balance' => 'decimal:2',
    ];

    // Account Types
    const TYPE_ASSET = 'asset';
    const TYPE_LIABILITY = 'liability';
    const TYPE_EQUITY = 'equity';
    const TYPE_REVENUE = 'revenue';
    const TYPE_EXPENSE = 'expense';

    public static function types(): array
    {
        return [
            self::TYPE_ASSET,
            self::TYPE_LIABILITY,
            self::TYPE_EQUITY,
            self::TYPE_REVENUE,
            self::TYPE_EXPENSE,
        ];
    }

    // Relationships
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function parent()
    {
        return $this->belongsTo(ChartOfAccount::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ChartOfAccount::class, 'parent_id');
    }

    public function journalEntries()
    {
        return $this->hasMany(JournalEntry::class, 'account_id');
    }

    public function generalLedgerEntries()
    {
        return $this->hasMany(GeneralLedgerEntry::class, 'account_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    // Helper Methods
    public function getFullNameAttribute()
    {
        return $this->code . ' - ' . $this->name;
    }

    public function isAsset(): bool
    {
        return $this->type === self::TYPE_ASSET;
    }

    public function isLiability(): bool
    {
        return $this->type === self::TYPE_LIABILITY;
    }

    public function isEquity(): bool
    {
        return $this->type === self::TYPE_EQUITY;
    }

    public function isRevenue(): bool
    {
        return $this->type === self::TYPE_REVENUE;
    }

    public function isExpense(): bool
    {
        return $this->type === self::TYPE_EXPENSE;
    }

    public function updateBalance($amount, $type = 'debit')
    {
        if ($type === 'debit') {
            $this->balance += $amount;
        } else {
            $this->balance -= $amount;
        }
        $this->save();
    }
}
