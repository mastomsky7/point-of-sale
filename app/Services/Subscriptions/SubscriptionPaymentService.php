<?php

namespace App\Services\Subscriptions;

use App\Mail\SubscriptionPaymentFailed;
use App\Mail\SubscriptionPaymentSuccess;
use App\Mail\SubscriptionSuspended;
use App\Models\ClientSubscription;
use App\Models\SubscriptionPayment;
use App\Services\Payments\PaymentGatewayManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SubscriptionPaymentService
{
    protected PaymentGatewayManager $paymentManager;

    public function __construct(PaymentGatewayManager $paymentManager)
    {
        $this->paymentManager = $paymentManager;
    }

    /**
     * Process subscription payment
     */
    public function processPayment(ClientSubscription $subscription): array
    {
        DB::beginTransaction();

        try {
            $plan = $subscription->plan;
            $client = $subscription->client;

            // Get active payment merchant for client
            $merchant = $client->merchants()
                ->where('is_active', true)
                ->where('is_subscription_enabled', true)
                ->first();

            if (!$merchant) {
                throw new \Exception('No active subscription payment merchant found for client');
            }

            // Prepare payment data
            $paymentData = [
                'amount' => $plan->price,
                'currency' => $plan->currency,
                'description' => sprintf(
                    'Subscription Renewal - %s - %s',
                    $plan->name,
                    now()->format('F Y')
                ),
                'customer_name' => $client->company_name ?? $client->name,
                'customer_email' => $client->email,
                'customer_phone' => $client->phone,
                'metadata' => [
                    'subscription_id' => $subscription->id,
                    'client_id' => $client->id,
                    'plan_id' => $plan->id,
                    'type' => 'subscription_renewal',
                    'billing_period' => $subscription->current_period_start?->format('Y-m-d') . ' to ' . $subscription->current_period_end?->format('Y-m-d'),
                ],
            ];

            // Create payment through gateway
            $gateway = $this->paymentManager->gateway($merchant->gateway_type);
            $result = $gateway->createCharge($paymentData);

            // Create subscription payment record
            $payment = $this->createPaymentRecord($subscription, $merchant, $result);

            DB::commit();

            Log::info('Subscription payment initiated', [
                'subscription_id' => $subscription->id,
                'payment_id' => $payment->id,
                'amount' => $plan->price,
                'gateway' => $merchant->gateway_type,
            ]);

            return [
                'success' => true,
                'payment' => $payment,
                'payment_url' => $result['payment_url'] ?? null,
                'transaction_id' => $result['transaction_id'] ?? null,
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Subscription payment failed', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Create failed payment record
            $this->createFailedPaymentRecord($subscription, $e->getMessage());

            throw $e;
        }
    }

    /**
     * Handle successful payment
     */
    public function handlePaymentSuccess(string $transactionId, array $paymentData = []): bool
    {
        DB::beginTransaction();

        try {
            // Find payment record
            $payment = SubscriptionPayment::where('transaction_id', $transactionId)->firstOrFail();
            $subscription = $payment->subscription;

            // Update payment status
            $payment->update([
                'status' => 'completed',
                'paid_at' => now(),
                'gateway_response' => json_encode($paymentData),
            ]);

            // Calculate next billing date
            $nextBillingDate = $this->calculateNextBillingDate($subscription);

            // Update subscription
            $subscription->update([
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => $nextBillingDate,
                'next_billing_date' => $nextBillingDate,
                'last_billing_attempt' => now(),
                'billing_failure_count' => 0,
                'payment_method' => $payment->payment_method,
                'billing_metadata' => json_encode([
                    'last_payment_id' => $payment->id,
                    'last_payment_date' => now()->toDateTimeString(),
                    'last_transaction_id' => $transactionId,
                ]),
            ]);

            // Update all store licenses for this client
            $client = $subscription->client;
            foreach ($client->stores as $store) {
                if ($license = $store->license) {
                    $license->update([
                        'status' => 'active',
                        'expires_at' => $nextBillingDate,
                        'suspended_at' => null,
                    ]);
                }
            }

            DB::commit();

            Log::info('Subscription payment completed successfully', [
                'subscription_id' => $subscription->id,
                'payment_id' => $payment->id,
                'transaction_id' => $transactionId,
                'next_billing_date' => $nextBillingDate->toDateTimeString(),
            ]);

            // Send success email notification
            try {
                if ($client->email) {
                    Mail::to($client->email)->send(new SubscriptionPaymentSuccess($subscription, $payment));
                    Log::info('Payment success email sent', [
                        'subscription_id' => $subscription->id,
                        'email' => $client->email,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send payment success email', [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return true;

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to handle payment success', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Handle failed payment
     */
    public function handlePaymentFailure(string $transactionId, string $reason = 'Payment failed'): bool
    {
        DB::beginTransaction();

        try {
            // Find payment record
            $payment = SubscriptionPayment::where('transaction_id', $transactionId)->firstOrFail();
            $subscription = $payment->subscription;

            // Update payment status
            $payment->update([
                'status' => 'failed',
                'failure_reason' => $reason,
            ]);

            // Increment failure count
            $subscription->increment('billing_failure_count');
            $subscription->update([
                'last_billing_attempt' => now(),
            ]);

            // If too many failures, change status to past_due
            if ($subscription->billing_failure_count >= 3) {
                $subscription->update([
                    'status' => 'past_due',
                ]);

                Log::warning('Subscription marked as past due', [
                    'subscription_id' => $subscription->id,
                    'failure_count' => $subscription->billing_failure_count,
                ]);
            }

            // If failures exceed threshold, suspend
            if ($subscription->billing_failure_count >= 5) {
                $subscription->update([
                    'status' => 'suspended',
                    'suspended_at' => now(),
                ]);

                // Suspend store licenses
                $client = $subscription->client;
                foreach ($client->stores as $store) {
                    if ($license = $store->license) {
                        $license->update([
                            'status' => 'suspended',
                            'suspended_at' => now(),
                        ]);
                    }
                }

                Log::warning('Subscription suspended due to repeated payment failures', [
                    'subscription_id' => $subscription->id,
                    'failure_count' => $subscription->billing_failure_count,
                ]);
            }

            DB::commit();

            Log::error('Subscription payment failed', [
                'subscription_id' => $subscription->id,
                'payment_id' => $payment->id,
                'transaction_id' => $transactionId,
                'reason' => $reason,
                'failure_count' => $subscription->billing_failure_count,
            ]);

            // Send failure email notification
            try {
                if ($client->email) {
                    Mail::to($client->email)->send(new SubscriptionPaymentFailed($subscription, $payment));
                    Log::info('Payment failure email sent', [
                        'subscription_id' => $subscription->id,
                        'email' => $client->email,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send payment failure email', [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // Send suspension email if suspended
            if ($subscription->status === 'suspended') {
                try {
                    if ($client->email) {
                        Mail::to($client->email)->send(new SubscriptionSuspended($subscription));
                        Log::info('Suspension email sent', [
                            'subscription_id' => $subscription->id,
                            'email' => $client->email,
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to send suspension email', [
                        'subscription_id' => $subscription->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return true;

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to handle payment failure', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Create payment record
     */
    protected function createPaymentRecord(
        ClientSubscription $subscription,
        $merchant,
        array $gatewayResult
    ): SubscriptionPayment {
        return $subscription->payments()->create([
            'amount' => $subscription->plan->price,
            'currency' => $subscription->plan->currency,
            'status' => 'pending',
            'payment_method' => $merchant->gateway_type,
            'transaction_id' => $gatewayResult['transaction_id'] ?? null,
            'payment_url' => $gatewayResult['payment_url'] ?? null,
            'gateway_response' => json_encode($gatewayResult),
            'metadata' => json_encode([
                'merchant_id' => $merchant->id,
                'plan_id' => $subscription->plan_id,
                'client_id' => $subscription->client_id,
            ]),
        ]);
    }

    /**
     * Create failed payment record
     */
    protected function createFailedPaymentRecord(ClientSubscription $subscription, string $error): void
    {
        try {
            $subscription->payments()->create([
                'amount' => $subscription->plan->price,
                'currency' => $subscription->plan->currency,
                'status' => 'failed',
                'payment_method' => 'unknown',
                'failure_reason' => $error,
                'metadata' => json_encode([
                    'error' => $error,
                    'timestamp' => now()->toDateTimeString(),
                ]),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create failed payment record', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Calculate next billing date
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
}
