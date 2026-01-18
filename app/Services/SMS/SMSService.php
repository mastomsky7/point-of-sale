<?php

namespace App\Services\SMS;

use App\Models\PaymentSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SMSService
{
    protected $settings;
    protected $config;

    public function __construct()
    {
        $this->settings = PaymentSetting::first();
        $this->config = $this->settings?->smsConfig() ?? [];
    }

    /**
     * Check if SMS integration is enabled
     */
    public function isEnabled(): bool
    {
        return $this->settings?->isSmsReady() ?? false;
    }

    /**
     * Send SMS message using configured provider
     */
    public function sendMessage(string $to, string $message): array
    {
        if (!$this->isEnabled()) {
            Log::warning('SMS not enabled or not configured');
            return [
                'success' => false,
                'error' => 'SMS integration not enabled'
            ];
        }

        $provider = $this->config['provider'];

        try {
            return match ($provider) {
                'twilio' => $this->sendViaTwilio($to, $message),
                'vonage' => $this->sendViaVonage($to, $message),
                'zenziva' => $this->sendViaZenziva($to, $message),
                'custom' => $this->sendViaCustom($to, $message),
                default => [
                    'success' => false,
                    'error' => 'Unknown SMS provider: ' . $provider
                ]
            };
        } catch (\Exception $e) {
            Log::error('SMS send error', [
                'to' => $to,
                'provider' => $provider,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send SMS via Twilio
     */
    protected function sendViaTwilio(string $to, string $message): array
    {
        $config = $this->config['twilio'];
        $url = "https://api.twilio.com/2010-04-01/Accounts/{$config['sid']}/Messages.json";

        $response = Http::asForm()
            ->withBasicAuth($config['sid'], $config['token'])
            ->post($url, [
                'From' => $config['from'],
                'To' => $this->formatPhoneNumber($to),
                'Body' => $message,
            ]);

        if ($response->successful()) {
            Log::info('SMS sent successfully via Twilio', [
                'to' => $to,
                'sid' => $response->json('sid')
            ]);

            return [
                'success' => true,
                'data' => $response->json()
            ];
        }

        Log::error('Twilio API error', [
            'to' => $to,
            'status' => $response->status(),
            'response' => $response->json()
        ]);

        return [
            'success' => false,
            'error' => $response->json('message') ?? 'Unknown Twilio error'
        ];
    }

    /**
     * Send SMS via Vonage (Nexmo)
     */
    protected function sendViaVonage(string $to, string $message): array
    {
        $config = $this->config['vonage'];
        $url = 'https://rest.nexmo.com/sms/json';

        $response = Http::asForm()->post($url, [
            'api_key' => $config['key'],
            'api_secret' => $config['secret'],
            'from' => $config['from'],
            'to' => $this->formatPhoneNumber($to),
            'text' => $message,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $firstMessage = $data['messages'][0] ?? [];

            if (($firstMessage['status'] ?? '1') === '0') {
                Log::info('SMS sent successfully via Vonage', [
                    'to' => $to,
                    'message_id' => $firstMessage['message-id'] ?? null
                ]);

                return [
                    'success' => true,
                    'data' => $data
                ];
            }

            Log::error('Vonage API error', [
                'to' => $to,
                'error_text' => $firstMessage['error-text'] ?? 'Unknown error'
            ]);

            return [
                'success' => false,
                'error' => $firstMessage['error-text'] ?? 'Failed to send SMS'
            ];
        }

        return [
            'success' => false,
            'error' => 'Vonage API request failed'
        ];
    }

    /**
     * Send SMS via Zenziva (Indonesian SMS Gateway)
     */
    protected function sendViaZenziva(string $to, string $message): array
    {
        $config = $this->config['zenziva'];
        $url = 'https://console.zenziva.net/warung/api/sendSMS/';

        $response = Http::asForm()->post($url, [
            'userkey' => $config['userkey'],
            'passkey' => $config['passkey'],
            'nohp' => $this->formatPhoneNumberLocal($to),
            'pesan' => $message,
        ]);

        if ($response->successful()) {
            $data = $response->json();

            if (isset($data['status']) && $data['status'] == 1) {
                Log::info('SMS sent successfully via Zenziva', [
                    'to' => $to,
                    'message_id' => $data['messageId'] ?? null
                ]);

                return [
                    'success' => true,
                    'data' => $data
                ];
            }

            Log::error('Zenziva API error', [
                'to' => $to,
                'response' => $data
            ]);

            return [
                'success' => false,
                'error' => $data['text'] ?? 'Failed to send SMS'
            ];
        }

        return [
            'success' => false,
            'error' => 'Zenziva API request failed'
        ];
    }

    /**
     * Send SMS via custom gateway
     */
    protected function sendViaCustom(string $to, string $message): array
    {
        $config = $this->config['custom'];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $config['api_key'],
            'Content-Type' => 'application/json',
        ])->post($config['api_url'], [
            'to' => $this->formatPhoneNumber($to),
            'from' => $config['sender_id'] ?? 'POS',
            'message' => $message,
        ]);

        if ($response->successful()) {
            Log::info('SMS sent successfully via custom gateway', [
                'to' => $to
            ]);

            return [
                'success' => true,
                'data' => $response->json()
            ];
        }

        Log::error('Custom SMS gateway error', [
            'to' => $to,
            'status' => $response->status(),
            'response' => $response->body()
        ]);

        return [
            'success' => false,
            'error' => 'Custom gateway request failed'
        ];
    }

    /**
     * F2: Send receipt SMS to customer
     */
    public function sendReceipt($transaction): array
    {
        if (!$this->settings?->sms_send_receipt) {
            return ['success' => false, 'error' => 'Receipt SMS disabled'];
        }

        if (!$transaction->customer || !$transaction->customer->phone) {
            return ['success' => false, 'error' => 'Customer phone number not found'];
        }

        $message = $this->formatReceiptMessage($transaction);

        return $this->sendMessage(
            $transaction->customer->phone,
            $message
        );
    }

    /**
     * F2: Send appointment confirmation SMS
     */
    public function sendAppointmentConfirmation($appointment): array
    {
        if (!$this->settings?->sms_send_appointment) {
            return ['success' => false, 'error' => 'Appointment SMS disabled'];
        }

        if (!$appointment->customer || !$appointment->customer->phone) {
            return ['success' => false, 'error' => 'Customer phone number not found'];
        }

        $message = $this->formatAppointmentMessage($appointment);

        return $this->sendMessage(
            $appointment->customer->phone,
            $message
        );
    }

    /**
     * F2: Send appointment reminder SMS
     */
    public function sendAppointmentReminder($appointment, string $type = '24h'): array
    {
        if (!$this->settings?->sms_send_reminder) {
            return ['success' => false, 'error' => 'Reminder SMS disabled'];
        }

        if (!$appointment->customer || !$appointment->customer->phone) {
            return ['success' => false, 'error' => 'Customer phone number not found'];
        }

        $message = $this->formatAppointmentReminderMessage($appointment, $type);

        return $this->sendMessage(
            $appointment->customer->phone,
            $message
        );
    }

    /**
     * F2: Send appointment rescheduled SMS
     */
    public function sendAppointmentRescheduled($appointment, $oldDateTime): array
    {
        if (!$this->settings?->sms_send_appointment) {
            return ['success' => false, 'error' => 'Appointment SMS disabled'];
        }

        if (!$appointment->customer || !$appointment->customer->phone) {
            return ['success' => false, 'error' => 'Customer phone number not found'];
        }

        $message = $this->formatAppointmentRescheduledMessage($appointment, $oldDateTime);

        return $this->sendMessage(
            $appointment->customer->phone,
            $message
        );
    }

    /**
     * Format phone number to international format (+62)
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If starts with 0, replace with 62 (Indonesia)
        if (substr($phone, 0, 1) === '0') {
            $phone = '62' . substr($phone, 1);
        }

        // If doesn't start with country code, add 62
        if (substr($phone, 0, 2) !== '62') {
            $phone = '62' . $phone;
        }

        // Add + prefix for international format
        return '+' . $phone;
    }

    /**
     * Format phone number to local format (0xxx) for Indonesian gateways
     */
    protected function formatPhoneNumberLocal(string $phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Remove country code if present
        if (substr($phone, 0, 2) === '62') {
            $phone = '0' . substr($phone, 2);
        }

        // Ensure starts with 0
        if (substr($phone, 0, 1) !== '0') {
            $phone = '0' . $phone;
        }

        return $phone;
    }

    /**
     * Format receipt message (plain text for SMS)
     */
    protected function formatReceiptMessage($transaction): string
    {
        $businessName = config('app.name', 'Point of Sales');

        $message = "{$businessName}\n";
        $message .= "TRANSACTION RECEIPT\n\n";
        $message .= "Invoice: {$transaction->invoice}\n";
        $message .= "Date: " . \Carbon\Carbon::parse($transaction->created_at)->format('d M Y H:i') . "\n";
        $message .= "Cashier: {$transaction->cashier->name}\n\n";

        // Items (limited for SMS)
        $itemCount = $transaction->details->count();
        $message .= "Items: {$itemCount} item(s)\n";

        // Show first 2 items only
        $transaction->details->take(2)->each(function ($detail) use (&$message) {
            if ($detail->product_id) {
                $message .= "- {$detail->product->title} ({$detail->qty}x)\n";
            } elseif ($detail->service_id) {
                $message .= "- {$detail->service->name} ({$detail->qty}x)\n";
            }
        });

        if ($itemCount > 2) {
            $message .= "...and " . ($itemCount - 2) . " more\n";
        }

        $message .= "\nTotal: Rp " . number_format($transaction->grand_total, 0, ',', '.') . "\n";
        $message .= "Payment: " . strtoupper($transaction->payment_method) . "\n";

        if ($transaction->payment_method === 'cash' && $transaction->change > 0) {
            $message .= "Change: Rp " . number_format($transaction->change, 0, ',', '.') . "\n";
        }

        $message .= "\nThank you for your purchase!";

        return $message;
    }

    /**
     * Format appointment confirmation message (plain text for SMS)
     */
    protected function formatAppointmentMessage($appointment): string
    {
        $businessName = config('app.name', 'Point of Sales');

        $message = "{$businessName}\n";
        $message .= "APPOINTMENT CONFIRMED\n\n";
        $message .= "Appointment #: {$appointment->appointment_number}\n";
        $message .= "Date: " . $appointment->appointment_date->format('d M Y') . "\n";
        $message .= "Time: " . $appointment->appointment_date->format('H:i') . "\n";

        if ($appointment->staff) {
            $message .= "Staff: {$appointment->staff->name}\n";
        }

        // Services (limited for SMS)
        $serviceCount = $appointment->services->count();
        if ($serviceCount > 0) {
            $message .= "\nServices:\n";
            $appointment->services->take(2)->each(function ($service) use (&$message) {
                $message .= "- {$service->name}\n";
            });

            if ($serviceCount > 2) {
                $message .= "...and " . ($serviceCount - 2) . " more\n";
            }
        }

        $message .= "\nTotal: Rp " . number_format($appointment->total_price, 0, ',', '.') . "\n";
        $message .= "Duration: {$appointment->duration} min\n";
        $message .= "\nPlease arrive 10 minutes early.";

        return $message;
    }

    /**
     * Format appointment reminder message (plain text for SMS)
     */
    protected function formatAppointmentReminderMessage($appointment, string $type = '24h'): string
    {
        $businessName = config('app.name', 'Point of Sales');

        $timeMessage = match($type) {
            '1h' => "Your appointment is in 1 hour!",
            '24h' => "Your appointment is tomorrow!",
            default => "Appointment reminder"
        };

        $message = "{$businessName}\n";
        $message .= "APPOINTMENT REMINDER\n\n";
        $message .= "Hi {$appointment->customer->name}!\n";
        $message .= "{$timeMessage}\n\n";
        $message .= "Appointment #: {$appointment->appointment_number}\n";
        $message .= "Date: " . $appointment->appointment_date->format('d M Y') . "\n";
        $message .= "Time: " . $appointment->appointment_date->format('H:i') . "\n";

        if ($appointment->staff) {
            $message .= "Staff: {$appointment->staff->name}\n";
        }

        $message .= "\nPlease arrive 10 minutes early.";

        return $message;
    }

    /**
     * Format appointment rescheduled message (plain text for SMS)
     */
    protected function formatAppointmentRescheduledMessage($appointment, $oldDateTime): string
    {
        $businessName = config('app.name', 'Point of Sales');
        $oldDate = \Carbon\Carbon::parse($oldDateTime);

        $message = "{$businessName}\n";
        $message .= "APPOINTMENT RESCHEDULED\n\n";
        $message .= "Hi {$appointment->customer->name}!\n\n";
        $message .= "PREVIOUS:\n";
        $message .= "Date: " . $oldDate->format('d M Y') . "\n";
        $message .= "Time: " . $oldDate->format('H:i') . "\n\n";
        $message .= "NEW SCHEDULE:\n";
        $message .= "Date: " . $appointment->appointment_date->format('d M Y') . "\n";
        $message .= "Time: " . $appointment->appointment_date->format('H:i') . "\n";

        if ($appointment->staff) {
            $message .= "Staff: {$appointment->staff->name}\n";
        }

        $message .= "\nAppointment #: {$appointment->appointment_number}\n";
        $message .= "Please arrive 10 minutes early.";

        return $message;
    }

    /**
     * Test SMS configuration
     */
    public function testConnection(string $testPhone): bool
    {
        try {
            $message = "Test SMS dari sistem POS. Jika Anda menerima SMS ini, konfigurasi SMS Anda sudah benar!";

            $result = $this->sendMessage($testPhone, $message);

            return $result['success'];

        } catch (\Exception $e) {
            Log::error('SMS test failed', [
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }
}
