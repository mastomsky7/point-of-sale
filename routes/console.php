<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// D2: Appointment Reminder Scheduling
Schedule::command('appointments:send-reminders --type=24h')
    ->hourly()
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Send 24-hour appointment reminders');

Schedule::command('appointments:send-reminders --type=1h')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Send 1-hour appointment reminders');

// H4: Background Job Scheduling
Schedule::job(new \App\Jobs\SendAppointmentReminders)
    ->hourly()
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Send appointment reminders via all channels');

Schedule::job(new \App\Jobs\UpdateCustomerLoyaltyTiers)
    ->daily()
    ->at('02:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Update customer loyalty tiers based on spending');

Schedule::job(new \App\Jobs\CacheWarmup)
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Warm up application caches for better performance');

// SaaS: Subscription Management
Schedule::command('subscriptions:check-expiries')
    ->dailyAt('01:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Check and process subscription renewals');

Schedule::command('subscriptions:check-expiries')
    ->dailyAt('13:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Midday check for subscription renewals');

// SaaS: Email Reminders
Schedule::command('subscriptions:send-reminders --days=7')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Send 7-day renewal reminders');

Schedule::command('subscriptions:send-reminders --days=3')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Send 3-day renewal reminders');

Schedule::command('subscriptions:send-reminders --days=1')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Send 1-day renewal reminders');

Schedule::command('subscriptions:send-reminders --trial --days=7')
    ->dailyAt('10:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Send 7-day trial ending reminders');

Schedule::command('subscriptions:send-reminders --trial --days=3')
    ->dailyAt('10:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Send 3-day trial ending reminders');

Schedule::command('subscriptions:send-reminders --trial --days=1')
    ->dailyAt('10:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->description('Send 1-day trial ending reminders');
