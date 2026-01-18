<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Scopes\ClientScopeTrait;

class Customer extends Model
{
    use HasFactory, ClientScopeTrait;

    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'name', 'phone', 'email', 'address',
        'loyalty_points', 'total_points_earned', 'total_points_redeemed',
        'loyalty_tier', 'total_spend', 'visit_count',
        'first_visit_at', 'last_visit_at',
    ];

    /**
     * E4: Cast attributes
     */
    protected $casts = [
        'first_visit_at' => 'datetime',
        'last_visit_at' => 'datetime',
        'total_spend' => 'decimal:2',
    ];

    /**
     * E1: Get customer's appointments
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * E1: Get customer's transactions
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * E1: Get customer's feedbacks
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(AppointmentFeedback::class);
    }

    /**
     * E4: Get loyalty tier badge data
     */
    public function getTierBadgeAttribute(): array
    {
        $tierData = [
            'bronze' => ['name' => 'Bronze', 'color' => 'amber', 'discount' => 0],
            'silver' => ['name' => 'Silver', 'color' => 'slate', 'discount' => 5],
            'gold' => ['name' => 'Gold', 'color' => 'yellow', 'discount' => 10],
            'platinum' => ['name' => 'Platinum', 'color' => 'purple', 'discount' => 15],
        ];

        return $tierData[$this->loyalty_tier] ?? $tierData['bronze'];
    }

    /**
     * E4: Calculate tier based on total spend
     */
    public function updateLoyaltyTier(): void
    {
        $spend = (float) $this->total_spend;

        if ($spend >= 10000000) { // 10M IDR
            $newTier = 'platinum';
        } elseif ($spend >= 5000000) { // 5M IDR
            $newTier = 'gold';
        } elseif ($spend >= 2000000) { // 2M IDR
            $newTier = 'silver';
        } else {
            $newTier = 'bronze';
        }

        if ($this->loyalty_tier !== $newTier) {
            $this->update(['loyalty_tier' => $newTier]);
        }
    }

    /**
     * E4: Add loyalty points for a purchase
     * 1 point per 10,000 IDR spent
     */
    public function addLoyaltyPoints(float $amount): int
    {
        $points = floor($amount / 10000);

        $this->increment('loyalty_points', $points);
        $this->increment('total_points_earned', $points);

        return $points;
    }

    /**
     * E4: Redeem loyalty points
     * 100 points = 10,000 IDR discount
     */
    public function redeemPoints(int $points): bool
    {
        if ($this->loyalty_points < $points) {
            return false;
        }

        $this->decrement('loyalty_points', $points);
        $this->increment('total_points_redeemed', $points);

        return true;
    }

    /**
     * E4: Get discount amount from points
     */
    public static function getDiscountFromPoints(int $points): float
    {
        return ($points / 100) * 10000;
    }
}
