<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'store_id',
        'expense_number',
        'category_id',
        'vendor_name',
        'expense_date',
        'amount',
        'payment_method',
        'description',
        'notes',
        'receipt_path',
        'is_approved',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2',
        'is_approved' => 'boolean',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
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

    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_approved', false);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }

    // Helper Methods
    public function approve()
    {
        if ($this->is_approved) {
            return false;
        }

        $this->is_approved = true;
        $this->approved_by = auth()->id();
        $this->approved_at = now();
        $this->save();

        // Create journal entry for the expense
        $this->createJournalEntry();

        return true;
    }

    protected function createJournalEntry()
    {
        // Get expense account from category
        $account = $this->category->account;

        if (!$account) {
            return;
        }

        JournalEntry::create([
            'client_id' => $this->client_id,
            'store_id' => $this->store_id,
            'entry_number' => JournalEntry::generateEntryNumber($this->client_id),
            'entry_date' => $this->expense_date,
            'account_id' => $account->id,
            'type' => JournalEntry::TYPE_DEBIT,
            'amount' => $this->amount,
            'description' => 'Expense: ' . $this->description,
            'reference_type' => ExpenseRecord::class,
            'reference_id' => $this->id,
            'posted_by' => auth()->id(),
            'is_posted' => true,
            'posted_at' => now(),
        ])->post();
    }

    public function getFormattedAmountAttribute()
    {
        return number_format($this->amount, 2);
    }

    public static function generateExpenseNumber($clientId)
    {
        $lastExpense = self::where('client_id', $clientId)
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastExpense) {
            return 'EXP-' . date('Ymd') . '-0001';
        }

        $lastNumber = intval(substr($lastExpense->expense_number, -4));
        $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return 'EXP-' . date('Ymd') . '-' . $newNumber;
    }
}
