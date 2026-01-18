<?php

namespace App\Console\Commands;

use App\Models\ClientSubscription;
use App\Jobs\ProcessSubscriptionRenewal;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckSubscriptionExpiries extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:check-expiries {--dry-run : Run without dispatching jobs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for expiring subscriptions and dispatch renewal jobs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expiring subscriptions...');

        $dryRun = $this->option('dry-run');

        // Get subscriptions that need renewal (next_billing_date is today or past)
        $subscriptions = ClientSubscription::with(['client', 'plan'])
            ->whereIn('status', ['active', 'past_due'])
            ->whereNotNull('next_billing_date')
            ->whereDate('next_billing_date', '<=', now())
            ->get();

        if ($subscriptions->isEmpty()) {
            $this->info('No subscriptions need renewal at this time.');
            return 0;
        }

        $this->info("Found {$subscriptions->count()} subscription(s) to process:");

        $renewed = 0;
        $failed = 0;

        foreach ($subscriptions as $subscription) {
            try {
                $client = $subscription->client;
                $plan = $subscription->plan;

                $this->line(sprintf(
                    '  - Client: %s | Plan: %s | Next Billing: %s',
                    $client->name,
                    $plan->name,
                    $subscription->next_billing_date->format('Y-m-d')
                ));

                if (!$dryRun) {
                    // Dispatch job to queue
                    ProcessSubscriptionRenewal::dispatch($subscription);
                    $renewed++;
                    $this->info('    ✓ Renewal job dispatched');
                } else {
                    $this->comment('    [DRY RUN] Would dispatch renewal job');
                }

            } catch (\Exception $e) {
                $failed++;
                $this->error("    ✗ Error: {$e->getMessage()}");
                Log::error('Failed to process subscription renewal', [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();

        if ($dryRun) {
            $this->info("Dry run complete. Would have dispatched {$subscriptions->count()} renewal job(s).");
        } else {
            $this->info("Successfully dispatched {$renewed} renewal job(s).");
            if ($failed > 0) {
                $this->warn("Failed to dispatch {$failed} job(s). Check logs for details.");
            }
        }

        return 0;
    }
}
