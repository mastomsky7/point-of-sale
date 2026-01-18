<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneralLedgerEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'store_id',
        'account_id',
        'journal_entry_id',
        'entry_date',
        'type',
        'amount',
        'balance_after',
        'description',
        'reference_type',
        'reference_id',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    const TYPE_DEBIT = 'debit';
    const TYPE_CREDIT = 'credit';

    // Relationships
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function account()
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_id');
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function reference()
    {
        return $this->morphTo('reference', 'reference_type', 'reference_id');
    }

    // Scopes
    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeForStore($query, $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    public function scopeForAccount($query, $accountId)
    {
        return $query->where('account_id', $accountId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('entry_date', [$startDate, $endDate]);
    }

    public function scopeDebit($query)
    {
        return $query->where('type', self::TYPE_DEBIT);
    }

    public function scopeCredit($query)
    {
        return $query->where('type', self::TYPE_CREDIT);
    }

    // Helper Methods
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($entry) {
            // Calculate balance after transaction
            $account = ChartOfAccount::find($entry->account_id);
            if ($account) {
                $entry->balance_after = $account->balance;
            }
        });
    }

    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 2);
    }

    public function getFormattedBalanceAttribute()
    {
        return number_format($this->balance_after, 2);
    }
}
