<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JournalEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'store_id',
        'entry_number',
        'entry_date',
        'account_id',
        'type',
        'amount',
        'description',
        'reference_type',
        'reference_id',
        'posted_by',
        'is_posted',
        'posted_at',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'amount' => 'decimal:2',
        'is_posted' => 'boolean',
        'posted_at' => 'datetime',
    ];

    // Entry Types
    const TYPE_DEBIT = 'debit';
    const TYPE_CREDIT = 'credit';

    // Reference Types
    const REF_TRANSACTION = 'transaction';
    const REF_INVOICE = 'invoice';
    const REF_EXPENSE = 'expense';
    const REF_PAYMENT = 'payment';
    const REF_MANUAL = 'manual';

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

    public function postedBy()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    // Polymorphic relationship for reference
    public function reference()
    {
        return $this->morphTo('reference', 'reference_type', 'reference_id');
    }

    // Scopes
    public function scopePosted($query)
    {
        return $query->where('is_posted', true);
    }

    public function scopeUnposted($query)
    {
        return $query->where('is_posted', false);
    }

    public function scopeDebit($query)
    {
        return $query->where('type', self::TYPE_DEBIT);
    }

    public function scopeCredit($query)
    {
        return $query->where('type', self::TYPE_CREDIT);
    }

    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeForStore($query, $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('entry_date', [$startDate, $endDate]);
    }

    // Helper Methods
    public function post()
    {
        if ($this->is_posted) {
            return false;
        }

        $this->is_posted = true;
        $this->posted_at = now();
        $this->posted_by = auth()->id();
        $this->save();

        // Update account balance
        $this->account->updateBalance($this->amount, $this->type);

        // Create general ledger entry
        GeneralLedgerEntry::create([
            'client_id' => $this->client_id,
            'store_id' => $this->store_id,
            'account_id' => $this->account_id,
            'journal_entry_id' => $this->id,
            'entry_date' => $this->entry_date,
            'type' => $this->type,
            'amount' => $this->amount,
            'description' => $this->description,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
        ]);

        return true;
    }

    public function unpost()
    {
        if (!$this->is_posted) {
            return false;
        }

        // Reverse account balance
        $reverseType = $this->type === self::TYPE_DEBIT ? self::TYPE_CREDIT : self::TYPE_DEBIT;
        $this->account->updateBalance($this->amount, $reverseType);

        // Delete general ledger entry
        GeneralLedgerEntry::where('journal_entry_id', $this->id)->delete();

        $this->is_posted = false;
        $this->posted_at = null;
        $this->save();

        return true;
    }

    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 2);
    }

    public static function generateEntryNumber($clientId)
    {
        $lastEntry = self::where('client_id', $clientId)
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastEntry) {
            return 'JE-' . date('Ymd') . '-0001';
        }

        $lastNumber = intval(substr($lastEntry->entry_number, -4));
        $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return 'JE-' . date('Ymd') . '-' . $newNumber;
    }
}
