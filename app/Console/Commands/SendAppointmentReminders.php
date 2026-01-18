<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Services\WhatsApp\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:send-reminders {--type=all : Type of reminders to send (24h, 1h, or all)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send appointment reminders via WhatsApp (24h and 1h before)';

    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        parent::__construct();
        $this->whatsappService = $whatsappService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->option('type');

        if (!$this->whatsappService->isEnabled()) {
            $this->error('WhatsApp service is not enabled. Please configure WhatsApp settings.');
            return 1;
        }

        $this->info('Starting appointment reminder process...');

        $sent24h = 0;
        $sent1h = 0;

        // Send 24-hour reminders
        if ($type === '24h' || $type === 'all') {
            $sent24h = $this->send24HourReminders();
        }

        // Send 1-hour reminders
        if ($type === '1h' || $type === 'all') {
            $sent1h = $this->send1HourReminders();
        }

        $this->info("Reminder process completed!");
        $this->info("24-hour reminders sent: {$sent24h}");
        $this->info("1-hour reminders sent: {$sent1h}");

        return 0;
    }

    /**
     * Send 24-hour reminders
     */
    private function send24HourReminders()
    {
        $tomorrow = Carbon::now()->addDay();
        $windowStart = $tomorrow->copy()->startOfHour();
        $windowEnd = $tomorrow->copy()->endOfHour();

        $appointments = Appointment::with(['customer', 'staff', 'services'])
            ->whereBetween('appointment_date', [$windowStart, $windowEnd])
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('reminder_24h_sent', false)
            ->get();

        $sentCount = 0;

        foreach ($appointments as $appointment) {
            $this->info("Sending 24h reminder for appointment #{$appointment->appointment_number}...");

            $result = $this->whatsappService->sendAppointmentReminder($appointment, '24h');

            if ($result['success']) {
                $appointment->update([
                    'reminder_24h_sent' => true,
                    'reminder_24h_sent_at' => now(),
                ]);
                $sentCount++;
                $this->info("✓ Sent to {$appointment->customer->name}");
            } else {
                $this->error("✗ Failed: {$result['error']}");
            }
        }

        return $sentCount;
    }

    /**
     * Send 1-hour reminders
     */
    private function send1HourReminders()
    {
        $oneHourLater = Carbon::now()->addHour();
        $windowStart = $oneHourLater->copy()->subMinutes(5);
        $windowEnd = $oneHourLater->copy()->addMinutes(5);

        $appointments = Appointment::with(['customer', 'staff', 'services'])
            ->whereBetween('appointment_date', [$windowStart, $windowEnd])
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('reminder_1h_sent', false)
            ->get();

        $sentCount = 0;

        foreach ($appointments as $appointment) {
            $this->info("Sending 1h reminder for appointment #{$appointment->appointment_number}...");

            $result = $this->whatsappService->sendAppointmentReminder($appointment, '1h');

            if ($result['success']) {
                $appointment->update([
                    'reminder_1h_sent' => true,
                    'reminder_1h_sent_at' => now(),
                ]);
                $sentCount++;
                $this->info("✓ Sent to {$appointment->customer->name}");
            } else {
                $this->error("✗ Failed: {$result['error']}");
            }
        }

        return $sentCount;
    }
}
