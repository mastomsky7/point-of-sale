<?php

namespace Tests\Unit;

use App\Models\Customer;
use App\Models\Transaction;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * I1: Test customer loyalty tier calculation
     */
    public function test_bronze_tier_for_new_customer(): void
    {
        $customer = Customer::factory()->create([
            'total_spend' => 0,
        ]);

        $customer->updateLoyaltyTier();

        $this->assertEquals('bronze', $customer->loyalty_tier);
    }

    /**
     * I1: Test silver tier threshold
     */
    public function test_silver_tier_for_medium_spender(): void
    {
        $customer = Customer::factory()->create([
            'total_spend' => 1500000, // 1.5M IDR
        ]);

        $customer->updateLoyaltyTier();

        $this->assertEquals('silver', $customer->loyalty_tier);
    }

    /**
     * I1: Test gold tier threshold
     */
    public function test_gold_tier_for_high_spender(): void
    {
        $customer = Customer::factory()->create([
            'total_spend' => 6000000, // 6M IDR
        ]);

        $customer->updateLoyaltyTier();

        $this->assertEquals('gold', $customer->loyalty_tier);
    }

    /**
     * I1: Test platinum tier threshold
     */
    public function test_platinum_tier_for_very_high_spender(): void
    {
        $customer = Customer::factory()->create([
            'total_spend' => 15000000, // 15M IDR
        ]);

        $customer->updateLoyaltyTier();

        $this->assertEquals('platinum', $customer->loyalty_tier);
    }

    /**
     * I1: Test loyalty points calculation
     */
    public function test_loyalty_points_calculation(): void
    {
        $customer = Customer::factory()->create([
            'loyalty_points' => 100,
        ]);

        // Add 500 points
        $customer->addLoyaltyPoints(500);

        $this->assertEquals(600, $customer->loyalty_points);
        $this->assertEquals(500, $customer->total_points_earned);
    }

    /**
     * I1: Test loyalty points redemption
     */
    public function test_loyalty_points_redemption(): void
    {
        $customer = Customer::factory()->create([
            'loyalty_points' => 1000,
            'total_points_redeemed' => 0,
        ]);

        $redeemed = $customer->redeemLoyaltyPoints(300);

        $this->assertTrue($redeemed);
        $this->assertEquals(700, $customer->loyalty_points);
        $this->assertEquals(300, $customer->total_points_redeemed);
    }

    /**
     * I1: Test cannot redeem more points than available
     */
    public function test_cannot_redeem_insufficient_points(): void
    {
        $customer = Customer::factory()->create([
            'loyalty_points' => 100,
        ]);

        $redeemed = $customer->redeemLoyaltyPoints(200);

        $this->assertFalse($redeemed);
        $this->assertEquals(100, $customer->loyalty_points);
    }

    /**
     * I1: Test customer transaction relationship
     */
    public function test_customer_has_transactions(): void
    {
        $customer = Customer::factory()->create();
        Transaction::factory()->count(3)->create([
            'customer_id' => $customer->id,
        ]);

        $this->assertCount(3, $customer->transactions);
        $this->assertInstanceOf(Transaction::class, $customer->transactions->first());
    }

    /**
     * I1: Test visit count increment
     */
    public function test_visit_count_increments(): void
    {
        $customer = Customer::factory()->create([
            'visit_count' => 5,
        ]);

        $customer->incrementVisitCount();

        $this->assertEquals(6, $customer->visit_count);
        $this->assertNotNull($customer->last_visit_at);
    }
}
