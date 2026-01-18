<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'store_id',
        'invoice_number',
        'customer_id',
        'invoice_date',
        'due_date',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'paid_amount',
        'status',
        'payment_status',
        'payment_method',
        'payment_date',
        'notes',
        'terms',
        'is_recurring',
        'recurring_frequency',
        'next_invoice_date',
        'created_by',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'payment_date' => 'datetime',
        'next_invoice_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'is_recurring' => 'boolean',
    ];

    // Status Constants
    const STATUS_DRAFT = 'draft';
    const STATUS_SENT = 'sent';
    const STATUS_VIEWED = 'viewed';
    const STATUS_PARTIAL = 'partial';
    const STATUS_PAID = 'paid';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_CANCELLED = 'cancelled';

    // Payment Status
    const PAYMENT_UNPAID = 'unpaid';
    const PAYMENT_PARTIAL = 'partial';
    const PAYMENT_PAID = 'paid';

    // Recurring Frequency
    const FREQ_WEEKLY = 'weekly';
    const FREQ_MONTHLY = 'monthly';
    const FREQ_QUARTERLY = 'quarterly';
    const FREQ_YEARLY = 'yearly';

    // Relationships
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments()
    {
        return $this->hasMany(InvoicePayment::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
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

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->where('payment_status', '!=', self::PAYMENT_PAID);
    }

    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    public function scopeDueForRecurring($query)
    {
        return $query->where('is_recurring', true)
            ->where('next_invoice_date', '<=', now());
    }

    // Helper Methods
    public function calculateTotals()
    {
        $this->subtotal = $this->items()->sum('total');
        $this->total_amount = $this->subtotal + $this->tax_amount - $this->discount_amount;
        $this->save();
    }

    public function addPayment($amount, $method = 'cash', $notes = null)
    {
        $payment = $this->payments()->create([
            'client_id' => $this->client_id,
            'amount' => $amount,
            'payment_method' => $method,
            'payment_date' => now(),
            'notes' => $notes,
        ]);

        $this->paid_amount += $amount;

        if ($this->paid_amount >= $this->total_amount) {
            $this->payment_status = self::PAYMENT_PAID;
            $this->status = self::STATUS_PAID;
            $this->payment_date = now();
        } elseif ($this->paid_amount > 0) {
            $this->payment_status = self::PAYMENT_PARTIAL;
            $this->status = self::STATUS_PARTIAL;
        }

        $this->save();

        return $payment;
    }

    public function getBalanceDueAttribute()
    {
        return $this->total_amount - $this->paid_amount;
    }

    public function getFormattedTotalAttribute()
    {
        return number_format($this->total_amount, 2);
    }

    public function getFormattedBalanceDueAttribute()
    {
        return number_format($this->balance_due, 2);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_PAID;
    }

    public function isOverdue(): bool
    {
        return $this->due_date < now() && !$this->isPaid();
    }

    public function markAsSent()
    {
        if ($this->status === self::STATUS_DRAFT) {
            $this->status = self::STATUS_SENT;
            $this->save();
        }
    }

    public function generateRecurringInvoice()
    {
        if (!$this->is_recurring || $this->next_invoice_date > now()) {
            return null;
        }

        $newInvoice = $this->replicate();
        $newInvoice->invoice_number = self::generateInvoiceNumber($this->client_id);
        $newInvoice->invoice_date = now();
        $newInvoice->due_date = $this->calculateNextDueDate();
        $newInvoice->status = self::STATUS_DRAFT;
        $newInvoice->payment_status = self::PAYMENT_UNPAID;
        $newInvoice->paid_amount = 0;
        $newInvoice->payment_date = null;
        $newInvoice->save();

        // Copy invoice items
        foreach ($this->items as $item) {
            $newItem = $item->replicate();
            $newItem->invoice_id = $newInvoice->id;
            $newItem->save();
        }

        // Update next invoice date
        $this->next_invoice_date = $this->calculateNextInvoiceDate();
        $this->save();

        return $newInvoice;
    }

    protected function calculateNextDueDate()
    {
        $daysToAdd = 30; // Default 30 days

        switch ($this->recurring_frequency) {
            case self::FREQ_WEEKLY:
                $daysToAdd = 7;
                break;
            case self::FREQ_MONTHLY:
                $daysToAdd = 30;
                break;
            case self::FREQ_QUARTERLY:
                $daysToAdd = 90;
                break;
            case self::FREQ_YEARLY:
                $daysToAdd = 365;
                break;
        }

        return now()->addDays($daysToAdd);
    }

    protected function calculateNextInvoiceDate()
    {
        switch ($this->recurring_frequency) {
            case self::FREQ_WEEKLY:
                return $this->next_invoice_date->addWeeks(1);
            case self::FREQ_MONTHLY:
                return $this->next_invoice_date->addMonths(1);
            case self::FREQ_QUARTERLY:
                return $this->next_invoice_date->addMonths(3);
            case self::FREQ_YEARLY:
                return $this->next_invoice_date->addYears(1);
            default:
                return $this->next_invoice_date->addMonths(1);
        }
    }

    public static function generateInvoiceNumber($clientId)
    {
        $lastInvoice = self::where('client_id', $clientId)
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastInvoice) {
            return 'INV-' . date('Ymd') . '-0001';
        }

        $lastNumber = intval(substr($lastInvoice->invoice_number, -4));
        $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return 'INV-' . date('Ymd') . '-' . $newNumber;
    }
}
