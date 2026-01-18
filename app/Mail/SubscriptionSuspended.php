<?php

namespace App\Mail;

use App\Models\ClientSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionSuspended extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public ClientSubscription $subscription;

    /**
     * Create a new message instance.
     */
    public function __construct(ClientSubscription $subscription)
    {
        $this->subscription = $subscription;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'URGENT: Your Subscription Has Been Suspended',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription.suspended',
            with: [
                'subscription' => $this->subscription,
                'client' => $this->subscription->client,
                'plan' => $this->subscription->plan,
                'suspendedAt' => $this->subscription->suspended_at,
                'failureCount' => $this->subscription->billing_failure_count,
                'amount' => $this->subscription->plan->price,
                'currency' => $this->subscription->plan->currency,
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
