<?php

namespace App\Console\Commands;

use App\Mail\SubscriptionRenewalReminder;
use App\Mail\TrialEndingSoon;
use App\Models\ClientSubscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendRenewalReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:send-reminders
                            {--days=7 : Number of days before renewal to send reminder}
                            {--trial : Send trial ending reminders instead}
                            {--dry-run : Run without sending emails}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send renewal reminders to clients with expiring subscriptions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $isTrial = $this->option('trial');
        $dryRun = $this->option('dry-run');

        $this->info('Checking for subscriptions needing reminders...');
        $this->line('Days before renewal: ' . $days);
        $this->line('Mode: ' . ($isTrial ? 'Trial Ending' : 'Subscription Renewal'));

        if ($dryRun) {
            $this->warn('[DRY RUN MODE - No emails will be sent]');
        }

        // Calculate target date
        $targetDate = now()->addDays($days)->startOfDay();

        if ($isTrial) {
            // Find subscriptions with trial ending
            $subscriptions = ClientSubscription::with(['client', 'plan'])
                ->where('status', 'trialing')
                ->whereNotNull('trial_ends_at')
                ->whereDate('trial_ends_at', $targetDate->toDateString())
                ->get();
        } else {
            // Find active subscriptions that need renewal reminders
            $subscriptions = ClientSubscription::with(['client', 'plan'])
                ->where('status', 'active')
                ->whereNotNull('next_billing_date')
                ->whereDate('next_billing_date', $targetDate->toDateString())
                ->get();
        }

        if ($subscriptions->isEmpty()) {
            $this->info('No subscriptions found needing reminders.');
            return 0;
        }

        $this->info(sprintf('Found %d subscription(s) to remind:', $subscriptions->count()));
        $this->newLine();

        $sent = 0;
        $failed = 0;

        foreach ($subscriptions as $subscription) {
            $client = $subscription->client;

            $this->line(sprintf(
                '  - Client: %s | Plan: %s | Date: %s',
                $client->company_name ?? $client->name,
                $subscription->plan->name,
                $isTrial ? $subscription->trial_ends_at->format('Y-m-d') : $subscription->next_billing_date->format('Y-m-d')
            ));

            if (!$client->email) {
                $this->error('    ✗ No email address for client');
                $failed++;
                continue;
            }

            if ($dryRun) {
                $this->comment('    [DRY RUN] Would send reminder to: ' . $client->email);
                $sent++;
                continue;
            }

            try {
                if ($isTrial) {
                    Mail::to($client->email)->send(new TrialEndingSoon($subscription, $days));
                } else {
                    Mail::to($client->email)->send(new SubscriptionRenewalReminder($subscription, $days));
                }

                $this->info('    ✓ Reminder sent to: ' . $client->email);
                $sent++;

                Log::info('Renewal reminder sent', [
                    'subscription_id' => $subscription->id,
                    'client_id' => $client->id,
                    'email' => $client->email,
                    'type' => $isTrial ? 'trial_ending' : 'renewal_reminder',
                    'days_until_expiry' => $days,
                ]);

            } catch (\Exception $e) {
                $this->error('    ✗ Failed to send: ' . $e->getMessage());
                $failed++;

                Log::error('Failed to send renewal reminder', [
                    'subscription_id' => $subscription->id,
                    'client_id' => $client->id,
                    'email' => $client->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info('Summary:');
        $this->line('  Total subscriptions: ' . $subscriptions->count());
        $this->line('  Reminders sent: ' . $sent);

        if ($failed > 0) {
            $this->line('  Failed: ' . $failed);
        }

        if ($dryRun) {
            $this->newLine();
            $this->warn('This was a dry run. Use without --dry-run flag to actually send emails.');
        }

        return 0;
    }
}
