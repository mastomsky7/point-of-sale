<?php

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpdateCustomerLoyaltyTiers implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * H4: Execute the job to update customer loyalty tiers
     */
    public function handle(): void
    {
        Log::info('UpdateCustomerLoyaltyTiers: Starting tier updates');

        $customers = Customer::whereHas('transactions')
            ->chunk(100, function ($customers) {
                foreach ($customers as $customer) {
                    try {
                        $oldTier = $customer->loyalty_tier;
                        $customer->updateLoyaltyTier();

                        if ($customer->loyalty_tier !== $oldTier) {
                            Log::info("Customer {$customer->id} tier updated from {$oldTier} to {$customer->loyalty_tier}");
                        }
                    } catch (\Exception $e) {
                        Log::error('UpdateCustomerLoyaltyTiers: Error updating customer ' . $customer->id, [
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            });

        Log::info('UpdateCustomerLoyaltyTiers: Job completed');
    }
}
