<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BudgetAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'store_id',
        'name',
        'period_start',
        'period_end',
        'total_budget',
        'spent_amount',
        'category_id',
        'status',
        'notes',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'total_budget' => 'decimal:2',
        'spent_amount' => 'decimal:2',
    ];

    // Status Constants
    const STATUS_ACTIVE = 'active';
    const STATUS_COMPLETED = 'completed';
    const STATUS_EXCEEDED = 'exceeded';
    const STATUS_CANCELLED = 'cancelled';

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

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('period_start', '<=', now())
            ->where('period_end', '>=', now());
    }

    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeForStore($query, $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    public function scopeExceeded($query)
    {
        return $query->whereRaw('spent_amount > total_budget');
    }

    // Helper Methods
    public function getRemainingBudgetAttribute()
    {
        return $this->total_budget - $this->spent_amount;
    }

    public function getUtilizationPercentageAttribute()
    {
        if ($this->total_budget == 0) {
            return 0;
        }
        return ($this->spent_amount / $this->total_budget) * 100;
    }

    public function isExceeded(): bool
    {
        return $this->spent_amount > $this->total_budget;
    }

    public function addExpense($amount)
    {
        $this->spent_amount += $amount;

        if ($this->isExceeded()) {
            $this->status = self::STATUS_EXCEEDED;
        }

        $this->save();
    }

    public function updateStatus()
    {
        if (now() > $this->period_end) {
            $this->status = self::STATUS_COMPLETED;
        } elseif ($this->isExceeded()) {
            $this->status = self::STATUS_EXCEEDED;
        } else {
            $this->status = self::STATUS_ACTIVE;
        }

        $this->save();
    }

    public function getFormattedBudgetAttribute()
    {
        return number_format($this->total_budget, 2);
    }

    public function getFormattedSpentAttribute()
    {
        return number_format($this->spent_amount, 2);
    }

    public function getFormattedRemainingAttribute()
    {
        return number_format($this->remaining_budget, 2);
    }
}
