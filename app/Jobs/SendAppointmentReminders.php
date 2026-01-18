<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\PaymentSetting;
use App\Services\WhatsApp\WhatsAppService;
use App\Services\Email\EmailService;
use App\Services\SMS\SMSService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendAppointmentReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * H4: Execute the job to send appointment reminders
     */
    public function handle(): void
    {
        $settings = PaymentSetting::first();

        if (!$settings) {
            Log::warning('SendAppointmentReminders: No payment settings found');
            return;
        }

        // Get reminder hours from settings (default 24 hours)
        $reminderHours = $settings->whatsapp_reminder_hours ?? 24;

        // Find appointments that need reminders
        $reminderTime = now()->addHours($reminderHours);

        $appointments = Appointment::whereIn('status', ['pending', 'confirmed'])
            ->where('appointment_date', '>=', now())
            ->where('appointment_date', '<=', $reminderTime)
            ->whereNull('reminder_sent_at')
            ->with(['customer', 'staff', 'services'])
            ->get();

        Log::info('SendAppointmentReminders: Processing ' . $appointments->count() . ' appointments');

        $whatsappService = app(WhatsAppService::class);
        $emailService = app(EmailService::class);
        $smsService = app(SMSService::class);

        foreach ($appointments as $appointment) {
            try {
                $remindersSent = 0;

                // Send WhatsApp reminder
                if ($settings->whatsapp_enabled && $settings->whatsapp_send_reminder) {
                    if ($whatsappService->sendAppointmentReminder($appointment, $reminderHours)) {
                        $remindersSent++;
                        Log::info("WhatsApp reminder sent for appointment {$appointment->id}");
                    }
                }

                // Send Email reminder
                if ($settings->email_enabled) {
                    if ($emailService->sendAppointmentReminder($appointment, $reminderHours)) {
                        $remindersSent++;
                        Log::info("Email reminder sent for appointment {$appointment->id}");
                    }
                }

                // Send SMS reminder
                if ($settings->sms_enabled && $settings->sms_send_reminder) {
                    if ($smsService->sendAppointmentReminder($appointment, $reminderHours)) {
                        $remindersSent++;
                        Log::info("SMS reminder sent for appointment {$appointment->id}");
                    }
                }

                // Mark reminder as sent if at least one channel succeeded
                if ($remindersSent > 0) {
                    $appointment->update([
                        'reminder_sent_at' => now(),
                    ]);
                }

            } catch (\Exception $e) {
                Log::error('SendAppointmentReminders: Error sending reminder for appointment ' . $appointment->id, [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        Log::info('SendAppointmentReminders: Job completed');
    }
}
