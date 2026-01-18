<?php

namespace App\Services\WhatsApp;

use App\Models\PaymentSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $settings;
    protected $apiUrl;
    protected $apiToken;
    protected $phoneNumber;

    public function __construct()
    {
        $this->settings = PaymentSetting::first();
        $this->apiUrl = $this->settings?->whatsapp_api_url;
        $this->apiToken = $this->settings?->whatsapp_api_token;
        $this->phoneNumber = $this->settings?->whatsapp_phone_number;
    }

    /**
     * Check if WhatsApp integration is enabled
     */
    public function isEnabled(): bool
    {
        return $this->settings?->whatsapp_enabled &&
               $this->apiUrl &&
               $this->apiToken;
    }

    /**
     * Send a message via WhatsApp Business API
     */
    public function sendMessage(string $to, string $message, array $options = []): array
    {
        if (!$this->isEnabled()) {
            Log::warning('WhatsApp not enabled or not configured');
            return [
                'success' => false,
                'error' => 'WhatsApp integration not enabled'
            ];
        }

        try {
            // Don't add /messages if URL already ends with it
            $endpoint = $this->apiUrl;
            if (!str_ends_with($endpoint, '/messages')) {
                $endpoint .= '/messages';
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
                'Content-Type' => 'application/json',
            ])->post($endpoint, [
                'messaging_product' => 'whatsapp',
                'to' => $this->formatPhoneNumber($to),
                'type' => 'text',
                'text' => [
                    'body' => $message,
                    'preview_url' => $options['preview_url'] ?? false,
                ],
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp message sent successfully', [
                    'to' => $to,
                    'response' => $response->json()
                ]);

                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error('WhatsApp API error', [
                'to' => $to,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json()['error']['message'] ?? 'Unknown error'
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp send error', [
                'to' => $to,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send template message (for structured messages)
     */
    public function sendTemplate(string $to, string $templateName, array $params = []): array
    {
        if (!$this->isEnabled()) {
            return [
                'success' => false,
                'error' => 'WhatsApp integration not enabled'
            ];
        }

        try {
            // Don't add /messages if URL already ends with it
            $endpoint = $this->apiUrl;
            if (!str_ends_with($endpoint, '/messages')) {
                $endpoint .= '/messages';
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
                'Content-Type' => 'application/json',
            ])->post($endpoint, [
                'messaging_product' => 'whatsapp',
                'to' => $this->formatPhoneNumber($to),
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => [
                        'code' => 'en'
                    ],
                    'components' => $params
                ],
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['error']['message'] ?? 'Unknown error'
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp template send error', [
                'to' => $to,
                'template' => $templateName,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send receipt/transaction notification
     */
    public function sendReceipt($transaction): array
    {
        if (!$this->settings?->whatsapp_send_receipt) {
            return ['success' => false, 'error' => 'Receipt sending disabled'];
        }

        if (!$transaction->customer || !$transaction->customer->phone) {
            return ['success' => false, 'error' => 'Customer phone number not found'];
        }

        $message = $this->formatReceiptMessage($transaction);

        return $this->sendMessage(
            $transaction->customer->phone,
            $message,
            ['preview_url' => true]
        );
    }

    /**
     * Send appointment confirmation
     */
    public function sendAppointmentConfirmation($appointment): array
    {
        if (!$this->settings?->whatsapp_send_appointment) {
            return ['success' => false, 'error' => 'Appointment notifications disabled'];
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
     * Send appointment reminder
     * D2: Updated to support reminder types (24h, 1h)
     */
    public function sendAppointmentReminder($appointment, string $type = '24h'): array
    {
        if (!$this->settings?->whatsapp_send_reminder) {
            return ['success' => false, 'error' => 'Reminder notifications disabled'];
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
     * E2: Send appointment rescheduled notification
     */
    public function sendAppointmentRescheduled($appointment, $oldDateTime): array
    {
        if (!$this->settings?->whatsapp_send_appointment) {
            return ['success' => false, 'error' => 'Appointment notifications disabled'];
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
     * Format phone number to international format
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

        return $phone;
    }

    /**
     * Format receipt message
     */
    protected function formatReceiptMessage($transaction): string
    {
        $businessName = config('app.name', 'Point of Sales');

        // Format items (both products and services)
        $items = $transaction->details->map(function ($detail) {
            if ($detail->product_id) {
                // Product item
                $itemName = $detail->product->title;
                $icon = "📦";
                $line = "{$icon} {$itemName}\n  {$detail->qty} × Rp " . number_format($detail->price, 0, ',', '.') . " = Rp " . number_format($detail->price * $detail->qty, 0, ',', '.');
            } elseif ($detail->service_id) {
                // Service item
                $itemName = $detail->service->name;
                $icon = "✂️";
                $line = "{$icon} {$itemName}";
                if ($detail->staff_id) {
                    $line .= "\n  _Staff: {$detail->staff->name}_";
                }
                if ($detail->duration) {
                    $line .= "\n  _Duration: {$detail->duration} min_";
                }
                $line .= "\n  {$detail->qty} × Rp " . number_format($detail->price, 0, ',', '.') . " = Rp " . number_format($detail->price * $detail->qty, 0, ',', '.');
            } else {
                $itemName = "Unknown Item";
                $icon = "•";
                $line = "{$icon} {$itemName}\n  {$detail->qty} × Rp " . number_format($detail->price, 0, ',', '.') . " = Rp " . number_format($detail->price * $detail->qty, 0, ',', '.');
            }

            return $line;
        })->join("\n\n");

        $message = "*{$businessName}*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n\n";
        $message .= "🧾 *TRANSACTION RECEIPT*\n\n";
        $message .= "Invoice: *{$transaction->invoice}*\n";
        $message .= "Date: " . Carbon::parse($transaction->getRawOriginal('created_at'))->format('d M Y, H:i') . "\n";
        $message .= "Cashier: {$transaction->cashier->name}\n\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "*ITEMS*\n\n";
        $message .= $items . "\n\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n";

        if ($transaction->discount > 0) {
            $message .= "Discount: -Rp " . number_format($transaction->discount, 0, ',', '.') . "\n";
        }

        $message .= "Total: *Rp " . number_format($transaction->grand_total, 0, ',', '.') . "*\n";
        $message .= "Payment: " . strtoupper($transaction->payment_method) . "\n";

        if ($transaction->payment_method === 'cash') {
            $message .= "Cash: Rp " . number_format($transaction->cash, 0, ',', '.') . "\n";
            $message .= "Change: Rp " . number_format($transaction->change, 0, ',', '.') . "\n";
        }

        $message .= "\n━━━━━━━━━━━━━━━━━━━━\n";

        // Add download invoice link
        $invoiceUrl = url("/transactions/{$transaction->invoice}/download");
        $message .= "📥 *Download Invoice (PDF)*\n";
        $message .= "{$invoiceUrl}\n\n";

        $message .= "Thank you for your purchase! 🙏\n";
        $message .= "_Powered by {$businessName}_";

        return $message;
    }

    /**
     * Format appointment confirmation message
     */
    protected function formatAppointmentMessage($appointment): string
    {
        $businessName = config('app.name', 'Point of Sales');
        $services = $appointment->services->map(function ($service) {
            return "• {$service->name} ({$service->pivot->duration} min) - Rp " . number_format($service->pivot->price, 0, ',', '.');
        })->join("\n");

        $message = "*{$businessName}*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n\n";
        $message .= "📅 *APPOINTMENT CONFIRMED*\n\n";
        $message .= "Appointment #: *{$appointment->appointment_number}*\n";
        $message .= "Date: *" . $appointment->appointment_date->format('d M Y') . "*\n";
        $message .= "Time: *" . $appointment->appointment_date->format('H:i') . "*\n";

        if ($appointment->staff) {
            $message .= "Staff: {$appointment->staff->name}\n";
        }

        $message .= "\n━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "*SERVICES*\n\n";
        $message .= $services . "\n\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "Total: *Rp " . number_format($appointment->total_price, 0, ',', '.') . "*\n";
        $message .= "Duration: {$appointment->duration} minutes\n";

        if ($appointment->notes) {
            $message .= "\nNotes: {$appointment->notes}\n";
        }

        $message .= "\n━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "Please arrive 10 minutes early ⏰\n";
        $message .= "\nTo cancel or reschedule, please contact us.\n";
        $message .= "_Powered by {$businessName}_";

        return $message;
    }

    /**
     * Format appointment reminder message
     * D2: Updated to support different reminder types
     */
    protected function formatAppointmentReminderMessage($appointment, string $type = '24h'): string
    {
        $businessName = config('app.name', 'Point of Sales');

        // Determine reminder urgency
        $reminderTitle = match($type) {
            '1h' => '🔔 *APPOINTMENT STARTING SOON*',
            '24h' => '⏰ *APPOINTMENT REMINDER*',
            default => '⏰ *APPOINTMENT REMINDER*'
        };

        $timeMessage = match($type) {
            '1h' => "Your appointment is in *1 hour*! ⏰",
            '24h' => "Your appointment is *tomorrow* at this time! 📅",
            default => "Your appointment is coming up soon!"
        };

        $message = "*{$businessName}*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n\n";
        $message .= "{$reminderTitle}\n\n";
        $message .= "Hi {$appointment->customer->name}!\n\n";
        $message .= "This is a friendly reminder about your upcoming appointment:\n\n";
        $message .= "Appointment #: *{$appointment->appointment_number}*\n";
        $message .= "Date: *" . $appointment->appointment_date->format('d M Y') . "*\n";
        $message .= "Time: *" . $appointment->appointment_date->format('H:i') . "*\n";

        if ($appointment->staff) {
            $message .= "Staff: {$appointment->staff->name}\n";
        }

        // Add services list
        if ($appointment->services && $appointment->services->isNotEmpty()) {
            $message .= "\n*Services:*\n";
            foreach ($appointment->services as $service) {
                $message .= "• {$service->name}\n";
            }
        }

        $message .= "\n{$timeMessage}\n\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "_Powered by {$businessName}_";

        return $message;
    }

    /**
     * E2: Format appointment rescheduled message
     */
    protected function formatAppointmentRescheduledMessage($appointment, $oldDateTime): string
    {
        $businessName = config('app.name', 'Point of Sales');
        $oldDate = \Carbon\Carbon::parse($oldDateTime);

        $message = "*{$businessName}*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n\n";
        $message .= "🔄 *APPOINTMENT RESCHEDULED*\n\n";
        $message .= "Hi {$appointment->customer->name}!\n\n";
        $message .= "Your appointment has been successfully rescheduled.\n\n";

        $message .= "━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "*PREVIOUS TIME:*\n";
        $message .= "Date: ~" . $oldDate->format('d M Y') . "~\n";
        $message .= "Time: ~" . $oldDate->format('H:i') . "~\n\n";

        $message .= "*NEW TIME:*\n";
        $message .= "Date: *" . $appointment->appointment_date->format('d M Y') . "*\n";
        $message .= "Time: *" . $appointment->appointment_date->format('H:i') . "*\n";

        if ($appointment->staff) {
            $message .= "Staff: {$appointment->staff->name}\n";
        }

        // Add services list
        if ($appointment->services && $appointment->services->isNotEmpty()) {
            $message .= "\n*Services:*\n";
            foreach ($appointment->services as $service) {
                $message .= "• {$service->name}\n";
            }
        }

        $message .= "\n━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "Appointment #: *{$appointment->appointment_number}*\n";
        $message .= "Total: *Rp " . number_format($appointment->total_price, 0, ',', '.') . "*\n\n";
        $message .= "Please arrive 10 minutes early ⏰\n";
        $message .= "\nNeed to reschedule again? Please contact us.\n";
        $message .= "_Powered by {$businessName}_";

        return $message;
    }
}
