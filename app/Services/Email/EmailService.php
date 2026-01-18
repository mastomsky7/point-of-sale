<?php

namespace App\Services\Email;

use App\Mail\InvoiceReceiptMail;
use App\Models\PaymentSetting;
use App\Models\Transaction;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    protected $paymentSetting;

    public function __construct()
    {
        $this->paymentSetting = PaymentSetting::first();
    }

    /**
     * Configure mail settings dynamically
     */
    protected function configureMailer(): void
    {
        if (!$this->paymentSetting || !$this->paymentSetting->isEmailReady()) {
            return;
        }

        $config = $this->paymentSetting->emailConfig();

        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'host' => $config['host'],
            'port' => $config['port'],
            'encryption' => $config['encryption'],
            'username' => $config['username'],
            'password' => $config['password'],
            'timeout' => null,
        ]);

        Config::set('mail.from.address', $config['from']['address']);
        Config::set('mail.from.name', $config['from']['name']);
    }

    /**
     * Send invoice receipt email to customer
     */
    public function sendReceipt(Transaction $transaction): bool
    {
        try {
            // Check if email is enabled and ready
            if (!$this->paymentSetting || !$this->paymentSetting->isEmailReady()) {
                Log::info('Email not configured, skipping receipt email', [
                    'invoice' => $transaction->invoice
                ]);
                return false;
            }

            // Check if send receipt is enabled
            if (!$this->paymentSetting->email_send_receipt) {
                Log::info('Email receipt disabled in settings', [
                    'invoice' => $transaction->invoice
                ]);
                return false;
            }

            // Check if customer has email
            if (!$transaction->customer || !$transaction->customer->email) {
                Log::warning('Customer email not available', [
                    'invoice' => $transaction->invoice,
                    'customer_id' => $transaction->customer_id
                ]);
                return false;
            }

            // Configure mailer
            $this->configureMailer();

            // Load transaction with relationships
            $transaction->load(['customer', 'details.product', 'details.service', 'cashier']);

            // Send email
            Mail::to($transaction->customer->email)
                ->send(new InvoiceReceiptMail(
                    $transaction,
                    $this->paymentSetting->email_receipt_message
                ));

            Log::info('Invoice receipt email sent successfully', [
                'invoice' => $transaction->invoice,
                'customer_email' => $transaction->customer->email
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send invoice receipt email', [
                'invoice' => $transaction->invoice,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * F1: Send appointment confirmation email
     */
    public function sendAppointmentConfirmation($appointment): bool
    {
        try {
            if (!$this->paymentSetting || !$this->paymentSetting->isEmailReady()) {
                return false;
            }

            if (!$this->paymentSetting->email_send_appointment ?? false) {
                return false;
            }

            if (!$appointment->customer || !$appointment->customer->email) {
                return false;
            }

            $this->configureMailer();
            $appointment->load(['customer', 'staff', 'services']);

            $subject = 'Appointment Confirmation - ' . $appointment->appointment_number;
            $message = $this->formatAppointmentEmail($appointment, 'confirmation');

            Mail::raw($message, function ($mail) use ($appointment, $subject) {
                $mail->to($appointment->customer->email)
                    ->subject($subject);
            });

            Log::info('Appointment confirmation email sent', [
                'appointment_id' => $appointment->id,
                'customer_email' => $appointment->customer->email
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send appointment confirmation email', [
                'appointment_id' => $appointment->id ?? null,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * F1: Send appointment reminder email
     */
    public function sendAppointmentReminder($appointment, string $type = '24h'): bool
    {
        try {
            if (!$this->paymentSetting || !$this->paymentSetting->isEmailReady()) {
                return false;
            }

            if (!$this->paymentSetting->email_send_reminder ?? false) {
                return false;
            }

            if (!$appointment->customer || !$appointment->customer->email) {
                return false;
            }

            $this->configureMailer();
            $appointment->load(['customer', 'staff', 'services']);

            $subject = 'Appointment Reminder - ' . $appointment->appointment_number;
            $message = $this->formatAppointmentEmail($appointment, 'reminder', $type);

            Mail::raw($message, function ($mail) use ($appointment, $subject) {
                $mail->to($appointment->customer->email)
                    ->subject($subject);
            });

            Log::info('Appointment reminder email sent', [
                'appointment_id' => $appointment->id,
                'type' => $type,
                'customer_email' => $appointment->customer->email
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send appointment reminder email', [
                'appointment_id' => $appointment->id ?? null,
                'type' => $type,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * F1: Send appointment rescheduled email
     */
    public function sendAppointmentRescheduled($appointment, $oldDateTime): bool
    {
        try {
            if (!$this->paymentSetting || !$this->paymentSetting->isEmailReady()) {
                return false;
            }

            if (!$this->paymentSetting->email_send_appointment ?? false) {
                return false;
            }

            if (!$appointment->customer || !$appointment->customer->email) {
                return false;
            }

            $this->configureMailer();
            $appointment->load(['customer', 'staff', 'services']);

            $subject = 'Appointment Rescheduled - ' . $appointment->appointment_number;
            $message = $this->formatAppointmentEmail($appointment, 'rescheduled', null, $oldDateTime);

            Mail::raw($message, function ($mail) use ($appointment, $subject) {
                $mail->to($appointment->customer->email)
                    ->subject($subject);
            });

            Log::info('Appointment rescheduled email sent', [
                'appointment_id' => $appointment->id,
                'customer_email' => $appointment->customer->email
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send appointment rescheduled email', [
                'appointment_id' => $appointment->id ?? null,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * F1: Format appointment email message
     */
    protected function formatAppointmentEmail($appointment, string $emailType, ?string $reminderType = null, $oldDateTime = null): string
    {
        $businessName = config('app.name', 'Point of Sales');

        $message = "{$businessName}\n";
        $message .= str_repeat('=', 50) . "\n\n";

        // Email title based on type
        if ($emailType === 'confirmation') {
            $message .= "APPOINTMENT CONFIRMED\n\n";
        } elseif ($emailType === 'reminder') {
            $reminderTitle = $reminderType === '1h' ? 'APPOINTMENT STARTING SOON' : 'APPOINTMENT REMINDER';
            $message .= "{$reminderTitle}\n\n";
        } elseif ($emailType === 'rescheduled') {
            $message .= "APPOINTMENT RESCHEDULED\n\n";
        }

        $message .= "Hi {$appointment->customer->name}!\n\n";

        // Reminder-specific message
        if ($emailType === 'reminder') {
            if ($reminderType === '1h') {
                $message .= "Your appointment is in 1 hour!\n\n";
            } else {
                $message .= "Your appointment is tomorrow at this time!\n\n";
            }
        }

        // Rescheduled-specific message
        if ($emailType === 'rescheduled' && $oldDateTime) {
            $oldDate = \Carbon\Carbon::parse($oldDateTime);
            $message .= "Your appointment has been rescheduled.\n\n";
            $message .= "PREVIOUS TIME:\n";
            $message .= "Date: " . $oldDate->format('l, F j, Y') . "\n";
            $message .= "Time: " . $oldDate->format('h:i A') . "\n\n";
            $message .= "NEW TIME:\n";
        }

        // Appointment details
        $message .= "Appointment #: {$appointment->appointment_number}\n";
        $message .= "Date: " . $appointment->appointment_date->format('l, F j, Y') . "\n";
        $message .= "Time: " . $appointment->appointment_date->format('h:i A') . "\n";

        if ($appointment->staff) {
            $message .= "Staff: {$appointment->staff->name}\n";
        }

        // Services
        if ($appointment->services && $appointment->services->isNotEmpty()) {
            $message .= "\nServices:\n";
            foreach ($appointment->services as $service) {
                $message .= "- {$service->name}\n";
            }
        }

        $message .= "\n" . str_repeat('=', 50) . "\n";
        $message .= "Total: Rp " . number_format($appointment->total_price, 0, ',', '.') . "\n";
        $message .= "Duration: {$appointment->duration} minutes\n\n";

        if ($appointment->notes) {
            $message .= "Notes: {$appointment->notes}\n\n";
        }

        $message .= str_repeat('=', 50) . "\n";
        $message .= "Please arrive 10 minutes early.\n\n";

        if ($emailType === 'confirmation') {
            $message .= "To cancel or reschedule, please contact us.\n";
        } elseif ($emailType === 'rescheduled') {
            $message .= "Need to reschedule again? Please contact us.\n";
        }

        $message .= "\nPowered by {$businessName}";

        return $message;
    }

    /**
     * Test email configuration
     */
    public function testConnection(string $testEmail): bool
    {
        try {
            $this->configureMailer();

            Mail::raw('Test email dari sistem POS. Jika Anda menerima email ini, konfigurasi email Anda sudah benar!', function ($message) use ($testEmail) {
                $message->to($testEmail)
                    ->subject('Test Email - POS System');
            });

            return true;

        } catch (\Exception $e) {
            Log::error('Email test failed', [
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}
