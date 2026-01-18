<?php

namespace App\Mail;

use App\Models\ClientSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrialEndingSoon extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public ClientSubscription $subscription;
    public int $daysRemaining;

    /**
     * Create a new message instance.
     */
    public function __construct(ClientSubscription $subscription, int $daysRemaining = 3)
    {
        $this->subscription = $subscription;
        $this->daysRemaining = $daysRemaining;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: sprintf('Your %s trial ends in %d days',
                $this->subscription->plan->name,
                $this->daysRemaining
            ),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription.trial-ending',
            with: [
                'subscription' => $this->subscription,
                'client' => $this->subscription->client,
                'plan' => $this->subscription->plan,
                'daysRemaining' => $this->daysRemaining,
                'trialEndsAt' => $this->subscription->trial_ends_at,
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
