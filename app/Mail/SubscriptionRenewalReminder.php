<?php

namespace App\Mail;

use App\Models\ClientSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionRenewalReminder extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public ClientSubscription $subscription;
    public int $daysUntilRenewal;

    /**
     * Create a new message instance.
     */
    public function __construct(ClientSubscription $subscription, int $daysUntilRenewal = 7)
    {
        $this->subscription = $subscription;
        $this->daysUntilRenewal = $daysUntilRenewal;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: sprintf('Your %s subscription renews in %d days',
                $this->subscription->plan->name,
                $this->daysUntilRenewal
            ),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription.renewal-reminder',
            with: [
                'subscription' => $this->subscription,
                'client' => $this->subscription->client,
                'plan' => $this->subscription->plan,
                'daysUntilRenewal' => $this->daysUntilRenewal,
                'renewalDate' => $this->subscription->next_billing_date,
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
