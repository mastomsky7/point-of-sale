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

class SubscriptionPaymentSuccess extends Mailable implements ShouldQueue
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
            subject: sprintf('Payment Successful - %s Subscription',
                $this->subscription->plan->name
            ),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription.payment-success',
            with: [
                'subscription' => $this->subscription,
                'payment' => $this->payment,
                'client' => $this->subscription->client,
                'plan' => $this->subscription->plan,
                'amount' => $this->payment->amount,
                'currency' => $this->payment->currency,
                'paidAt' => $this->payment->paid_at,
                'transactionId' => $this->payment->transaction_id,
                'nextBillingDate' => $this->subscription->next_billing_date,
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
