<?php

namespace App\Jobs;

use App\Models\ClientSubscription;
use App\Services\Payments\PaymentGatewayManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessSubscriptionRenewal implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    protected ClientSubscription $subscription;

    /**
     * Create a new job instance.
     */
    public function __construct(ClientSubscription $subscription)
    {
        $this->subscription = $subscription;
    }

    /**
     * Execute the job.
     */
    public function handle(PaymentGatewayManager $paymentManager): void
    {
        DB::beginTransaction();

        try {
            $subscription = $this->subscription->fresh();

            // Check if subscription is eligible for renewal
            if (!$this->isEligibleForRenewal($subscription)) {
                Log::info('Subscription not eligible for renewal', [
                    'subscription_id' => $subscription->id,
                    'status' => $subscription->status,
                ]);
                DB::commit();
                return;
            }

            $plan = $subscription->plan;
            $client = $subscription->client;

            // Calculate next billing date
            $nextBillingDate = $this->calculateNextBillingDate($subscription);

            // Renew subscription
            $subscription->update([
                'current_period_start' => now(),
                'current_period_end' => $nextBillingDate,
                'next_billing_date' => $nextBillingDate,
                'last_billing_attempt' => now(),
                'billing_failure_count' => 0,
                'status' => 'active',
            ]);

            DB::commit();

            Log::info('Subscription renewed successfully', [
                'subscription_id' => $subscription->id,
                'next_billing_date' => $nextBillingDate->toDateTimeString(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Subscription renewal failed', [
                'subscription_id' => $this->subscription->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Check if subscription is eligible for renewal
     */
    protected function isEligibleForRenewal(ClientSubscription $subscription): bool
    {
        if (!in_array($subscription->status, ['active', 'past_due'])) {
            return false;
        }

        if (!$subscription->next_billing_date) {
            return false;
        }

        if ($subscription->next_billing_date->isFuture()) {
            return false;
        }

        return true;
    }

    /**
     * Calculate next billing date based on interval
     */
    protected function calculateNextBillingDate(ClientSubscription $subscription)
    {
        $interval = $subscription->plan->billing_interval ?? 'monthly';
        $current = $subscription->next_billing_date ?? now();

        return match($interval) {
            'daily' => $current->addDay(),
            'weekly' => $current->addWeek(),
            'monthly' => $current->addMonth(),
            'quarterly' => $current->addMonths(3),
            'semi_annually' => $current->addMonths(6),
            'yearly' => $current->addYear(),
            default => $current->addMonth(),
        };
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessSubscriptionRenewal job failed permanently', [
            'subscription_id' => $this->subscription->id,
            'error' => $exception->getMessage(),
        ]);

        $this->subscription->update([
            'status' => 'past_due',
            'last_billing_attempt' => now(),
        ]);
    }
}
