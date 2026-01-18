<?php

namespace App\Mail;

use App\Models\ClientSubscription;
use App\Models\SubscriptionPayment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionPaymentFailed extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public ClientSubscription $subscription;
    public SubscriptionPayment $payment;

    /**
     * Create a new message instance.
     */
    public function __construct(ClientSubscription $subscription, SubscriptionPayment $payment)
    {
        $this->subscription = $subscription;
        $this->payment = $payment;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Action Required: Subscription Payment Failed',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription.payment-failed',
            with: [
                'subscription' => $this->subscription,
                'payment' => $this->payment,
                'client' => $this->subscription->client,
                'plan' => $this->subscription->plan,
                'amount' => $this->payment->amount,
                'currency' => $this->payment->currency,
                'failureReason' => $this->payment->failure_reason,
                'failureCount' => $this->subscription->billing_failure_count,
                'retryDate' => $this->subscription->next_billing_date,
                'suspensionWarning' => $this->subscription->billing_failure_count >= 3,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
