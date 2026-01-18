<?php

namespace App\Services\Notification;

use App\Models\PaymentSetting;
use App\Services\WhatsApp\WhatsAppService;
use App\Services\Email\EmailService;
use App\Services\SMS\SMSService;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    protected $whatsappService;
    protected $emailService;
    protected $smsService;
    protected $settings;

    public function __construct(
        WhatsAppService $whatsappService,
        EmailService $emailService,
        SMSService $smsService
    ) {
        $this->whatsappService = $whatsappService;
        $this->emailService = $emailService;
        $this->smsService = $smsService;
        $this->settings = PaymentSetting::first();
    }

    /**
     * Send transaction receipt notification
     *
     * @param array $transaction Transaction data
     * @param string $customerPhone Customer phone number
     * @param string|null $customerEmail Customer email
     * @return array Results of each notification channel
     */
    public function sendTransactionReceipt(array $transaction, string $customerPhone, ?string $customerEmail = null): array
    {
        $results = [
            'whatsapp' => false,
            'email' => false,
            'sms' => false,
        ];

        // Send WhatsApp notification
        if ($this->isWhatsAppEnabled()) {
            try {
                $message = $this->formatTransactionMessage($transaction);
                $results['whatsapp'] = $this->whatsappService->sendMessage($customerPhone, $message);
            } catch (\Exception $e) {
                Log::error('WhatsApp notification failed: ' . $e->getMessage());
            }
        }

        // Send Email notification
        if ($this->isEmailEnabled() && $customerEmail) {
            try {
                $results['email'] = $this->emailService->sendTransactionReceipt($customerEmail, $transaction);
            } catch (\Exception $e) {
                Log::error('Email notification failed: ' . $e->getMessage());
            }
        }

        // Send SMS notification
        if ($this->isSMSEnabled()) {
            try {
                $message = $this->formatTransactionMessage($transaction, 'sms');
                $results['sms'] = $this->smsService->sendMessage($customerPhone, $message);
            } catch (\Exception $e) {
                Log::error('SMS notification failed: ' . $e->getMessage());
            }
        }

        return $results;
    }

    /**
     * Send appointment reminder
     *
     * @param array $appointment Appointment data
     * @param string $customerPhone Customer phone number
     * @param string|null $customerEmail Customer email
     * @return array
     */
    public function sendAppointmentReminder(array $appointment, string $customerPhone, ?string $customerEmail = null): array
    {
        $results = [
            'whatsapp' => false,
            'email' => false,
            'sms' => false,
        ];

        // Send WhatsApp reminder
        if ($this->isWhatsAppEnabled()) {
            try {
                $message = $this->formatAppointmentMessage($appointment);
                $results['whatsapp'] = $this->whatsappService->sendMessage($customerPhone, $message);
            } catch (\Exception $e) {
                Log::error('WhatsApp appointment reminder failed: ' . $e->getMessage());
            }
        }

        // Send Email reminder
        if ($this->isEmailEnabled() && $customerEmail) {
            try {
                $results['email'] = $this->emailService->sendAppointmentReminder($customerEmail, $appointment);
            } catch (\Exception $e) {
                Log::error('Email appointment reminder failed: ' . $e->getMessage());
            }
        }

        // Send SMS reminder
        if ($this->isSMSEnabled()) {
            try {
                $message = $this->formatAppointmentMessage($appointment, 'sms');
                $results['sms'] = $this->smsService->sendMessage($customerPhone, $message);
            } catch (\Exception $e) {
                Log::error('SMS appointment reminder failed: ' . $e->getMessage());
            }
        }

        return $results;
    }

    /**
     * Send custom message to customer
     *
     * @param string $phone
     * @param string $message
     * @param string|null $email
     * @param array $channels Channels to use ['whatsapp', 'email', 'sms']
     * @return array
     */
    public function sendCustomMessage(string $phone, string $message, ?string $email = null, array $channels = ['whatsapp']): array
    {
        $results = [];

        if (in_array('whatsapp', $channels) && $this->isWhatsAppEnabled()) {
            try {
                $results['whatsapp'] = $this->whatsappService->sendMessage($phone, $message);
            } catch (\Exception $e) {
                Log::error('WhatsApp message failed: ' . $e->getMessage());
                $results['whatsapp'] = false;
            }
        }

        if (in_array('email', $channels) && $this->isEmailEnabled() && $email) {
            try {
                $results['email'] = $this->emailService->sendCustomMessage($email, $message);
            } catch (\Exception $e) {
                Log::error('Email message failed: ' . $e->getMessage());
                $results['email'] = false;
            }
        }

        if (in_array('sms', $channels) && $this->isSMSEnabled()) {
            try {
                $results['sms'] = $this->smsService->sendMessage($phone, $message);
            } catch (\Exception $e) {
                Log::error('SMS message failed: ' . $e->getMessage());
                $results['sms'] = false;
            }
        }

        return $results;
    }

    /**
     * Format transaction data into message
     *
     * @param array $transaction
     * @param string $format
     * @return string
     */
    protected function formatTransactionMessage(array $transaction, string $format = 'whatsapp'): string
    {
        $message = "🧾 *STRUK PEMBELIAN*\n\n";
        $message .= "Invoice: {$transaction['invoice']}\n";
        $message .= "Tanggal: {$transaction['date']}\n";
        $message .= "Kasir: {$transaction['cashier']}\n\n";

        $message .= "*Detail Pembelian:*\n";
        foreach ($transaction['items'] as $item) {
            $message .= "- {$item['name']} x{$item['qty']}\n";
            $message .= "  Rp " . number_format($item['total'], 0, ',', '.') . "\n";
        }

        $message .= "\n";
        $message .= "Subtotal: Rp " . number_format($transaction['subtotal'], 0, ',', '.') . "\n";

        if (isset($transaction['discount']) && $transaction['discount'] > 0) {
            $message .= "Diskon: Rp " . number_format($transaction['discount'], 0, ',', '.') . "\n";
        }

        $message .= "*Total: Rp " . number_format($transaction['grand_total'], 0, ',', '.') . "*\n";
        $message .= "Bayar: Rp " . number_format($transaction['cash'], 0, ',', '.') . "\n";
        $message .= "Kembali: Rp " . number_format($transaction['change'], 0, ',', '.') . "\n\n";
        $message .= "Terima kasih atas kunjungan Anda! 🙏";

        return $message;
    }

    /**
     * Format appointment data into message
     *
     * @param array $appointment
     * @param string $format
     * @return string
     */
    protected function formatAppointmentMessage(array $appointment, string $format = 'whatsapp'): string
    {
        $message = "📅 *PENGINGAT APPOINTMENT*\n\n";
        $message .= "Hai {$appointment['customer_name']},\n\n";
        $message .= "Anda memiliki appointment:\n";
        $message .= "Tanggal: {$appointment['date']}\n";
        $message .= "Waktu: {$appointment['time']}\n";
        $message .= "Layanan: {$appointment['service']}\n";

        if (isset($appointment['staff'])) {
            $message .= "Staff: {$appointment['staff']}\n";
        }

        $message .= "\nMohon datang tepat waktu. Terima kasih! 🙏";

        return $message;
    }

    /**
     * Check if WhatsApp is enabled
     *
     * @return bool
     */
    protected function isWhatsAppEnabled(): bool
    {
        return $this->settings &&
               $this->settings->whatsapp_enabled &&
               !empty($this->settings->whatsapp_api_key);
    }

    /**
     * Check if Email is enabled
     *
     * @return bool
     */
    protected function isEmailEnabled(): bool
    {
        return $this->settings &&
               $this->settings->email_enabled &&
               !empty($this->settings->email_host);
    }

    /**
     * Check if SMS is enabled
     *
     * @return bool
     */
    protected function isSMSEnabled(): bool
    {
        return $this->settings &&
               $this->settings->sms_enabled &&
               !empty($this->settings->sms_api_key);
    }
}
