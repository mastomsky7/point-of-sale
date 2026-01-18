<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationSettingController extends Controller
{
    /**
     * Show notification settings form
     */
    public function edit()
    {
        $setting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);

        return Inertia::render('Dashboard/Settings/Notification', [
            'setting' => $setting,
            'whatsappProviders' => $this->getWhatsAppProviders(),
            'emailProviders' => $this->getEmailProviders(),
        ]);
    }

    /**
     * Update notification settings
     */
    public function update(Request $request)
    {
        $setting = PaymentSetting::firstOrCreate([], [
            'default_gateway' => 'cash',
        ]);

        $data = $request->validate([
            // WhatsApp Settings
            'whatsapp_enabled' => ['boolean'],
            'whatsapp_api_url' => ['nullable', 'string'],
            'whatsapp_api_token' => ['nullable', 'string'],
            'whatsapp_phone_number' => ['nullable', 'string', 'max:50'],
            'whatsapp_business_id' => ['nullable', 'string', 'max:100'],

            // WhatsApp Message Settings
            'whatsapp_send_receipt' => ['boolean'],
            'whatsapp_send_appointment' => ['boolean'],
            'whatsapp_send_reminder' => ['boolean'],
            'whatsapp_reminder_hours' => ['integer', 'min:1', 'max:168'], // max 7 days

            // Email Settings
            'email_enabled' => ['boolean'],
            'email_driver' => ['nullable', 'string', 'in:smtp'],
            'email_host' => ['nullable', 'string'],
            'email_port' => ['nullable', 'integer'],
            'email_username' => ['nullable', 'string', 'email'],
            'email_password' => ['nullable', 'string'],
            'email_encryption' => ['nullable', 'string', 'in:tls,ssl'],
            'email_from_address' => ['nullable', 'string', 'email'],
            'email_from_name' => ['nullable', 'string', 'max:100'],

            // Email Message Settings
            'email_send_receipt' => ['boolean'],
            'email_receipt_message' => ['nullable', 'string'],
        ]);

        // Validate WhatsApp if enabled
        $whatsappEnabled = (bool) ($data['whatsapp_enabled'] ?? false);

        if ($whatsappEnabled) {
            if (empty($data['whatsapp_api_url']) || empty($data['whatsapp_api_token'])) {
                return back()->withErrors([
                    'whatsapp_api_url' => 'API URL dan API Token wajib diisi saat mengaktifkan WhatsApp.',
                ])->withInput();
            }
        }

        // Validate Email if enabled
        $emailEnabled = (bool) ($data['email_enabled'] ?? false);

        if ($emailEnabled) {
            $requiredEmailFields = [
                'email_host' => 'Email Host',
                'email_port' => 'Email Port',
                'email_username' => 'Email Username',
                'email_password' => 'Email Password',
                'email_from_address' => 'Email From Address',
            ];

            foreach ($requiredEmailFields as $field => $label) {
                if (empty($data[$field])) {
                    return back()->withErrors([
                        $field => "$label wajib diisi saat mengaktifkan Email.",
                    ])->withInput();
                }
            }
        }

        // Update settings
        $setting->update([
            'whatsapp_enabled' => $whatsappEnabled,
            'whatsapp_api_url' => $data['whatsapp_api_url'] ?? null,
            'whatsapp_api_token' => $data['whatsapp_api_token'] ?? null,
            'whatsapp_phone_number' => $data['whatsapp_phone_number'] ?? null,
            'whatsapp_business_id' => $data['whatsapp_business_id'] ?? null,
            'whatsapp_send_receipt' => (bool) ($data['whatsapp_send_receipt'] ?? false),
            'whatsapp_send_appointment' => (bool) ($data['whatsapp_send_appointment'] ?? false),
            'whatsapp_send_reminder' => (bool) ($data['whatsapp_send_reminder'] ?? false),
            'whatsapp_reminder_hours' => (int) ($data['whatsapp_reminder_hours'] ?? 24),

            'email_enabled' => $emailEnabled,
            'email_driver' => $data['email_driver'] ?? 'smtp',
            'email_host' => $data['email_host'] ?? null,
            'email_port' => $data['email_port'] ?? 587,
            'email_username' => $data['email_username'] ?? null,
            'email_password' => $data['email_password'] ?? null,
            'email_encryption' => $data['email_encryption'] ?? 'tls',
            'email_from_address' => $data['email_from_address'] ?? null,
            'email_from_name' => $data['email_from_name'] ?? 'POS System',
            'email_send_receipt' => (bool) ($data['email_send_receipt'] ?? true),
            'email_receipt_message' => $data['email_receipt_message'] ?? null,
        ]);

        return redirect()
            ->route('settings.notifications.edit')
            ->with('success', 'Konfigurasi notifikasi berhasil disimpan.');
    }

    /**
     * Get WhatsApp provider options
     */
    protected function getWhatsAppProviders(): array
    {
        return [
            [
                'value' => 'meta',
                'label' => 'Meta Cloud API (Official)',
                'description' => 'Official WhatsApp Business API from Meta. Free tier: 1,000 messages/month.',
                'url_example' => 'https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages',
                'free_tier' => true,
                'recommended' => true,
            ],
            [
                'value' => 'twilio',
                'label' => 'Twilio',
                'description' => 'Easy setup with excellent documentation. Pay per message (~$0.005/msg).',
                'url_example' => 'https://api.twilio.com/2010-04-01/Accounts/ACCOUNT_SID/Messages.json',
                'free_tier' => false,
                'recommended' => false,
            ],
            [
                'value' => 'wati',
                'label' => 'Wati',
                'description' => 'Indonesian market focused. Unlimited messages from $49/month.',
                'url_example' => 'https://live-server-XXXX.wati.io/api/v1/sendSessionMessage',
                'free_tier' => false,
                'recommended' => false,
            ],
            [
                'value' => 'woowa',
                'label' => 'WooWa',
                'description' => 'Indonesia only. Local support. Starting from Rp 200k/month.',
                'url_example' => 'https://api.woowa.id/v1/messages',
                'free_tier' => false,
                'recommended' => false,
            ],
            [
                'value' => 'vonage',
                'label' => 'Vonage (Nexmo)',
                'description' => 'Competitive pricing. Good for developers. €0.0042/message.',
                'url_example' => 'https://messages-sandbox.nexmo.com/v1/messages',
                'free_tier' => false,
                'recommended' => false,
            ],
            [
                'value' => 'custom',
                'label' => 'Custom Provider',
                'description' => 'Use your own WhatsApp Business API provider.',
                'url_example' => 'https://your-api-provider.com/v1/messages',
                'free_tier' => false,
                'recommended' => false,
            ],
        ];
    }

    /**
     * Get Email provider options
     */
    protected function getEmailProviders(): array
    {
        return [
            [
                'value' => 'gmail',
                'label' => 'Gmail',
                'description' => 'Google Gmail SMTP. Free dengan App Password.',
                'host' => 'smtp.gmail.com',
                'port' => 587,
                'encryption' => 'tls',
                'recommended' => true,
            ],
            [
                'value' => 'outlook',
                'label' => 'Outlook/Hotmail',
                'description' => 'Microsoft Outlook SMTP. Free untuk personal.',
                'host' => 'smtp-mail.outlook.com',
                'port' => 587,
                'encryption' => 'tls',
                'recommended' => false,
            ],
            [
                'value' => 'yahoo',
                'label' => 'Yahoo Mail',
                'description' => 'Yahoo SMTP. Memerlukan App Password.',
                'host' => 'smtp.mail.yahoo.com',
                'port' => 587,
                'encryption' => 'tls',
                'recommended' => false,
            ],
            [
                'value' => 'custom',
                'label' => 'Custom SMTP',
                'description' => 'Gunakan SMTP server kustom Anda.',
                'host' => '',
                'port' => 587,
                'encryption' => 'tls',
                'recommended' => false,
            ],
        ];
    }

    /**
     * Test WhatsApp connection
     */
    public function testWhatsApp(Request $request)
    {
        $request->validate([
            'phone_number' => ['required', 'string', 'max:20'],
        ]);

        $setting = PaymentSetting::first();

        if (!$setting || !$setting->whatsapp_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp belum diaktifkan. Aktifkan dan simpan konfigurasi terlebih dahulu.',
            ], 400);
        }

        try {
            $whatsappService = app(\App\Services\WhatsApp\WhatsAppService::class);

            $testMessage = "*Point of Sales - Test Message*\n\n";
            $testMessage .= "🧪 This is a test message from your POS system.\n\n";
            $testMessage .= "If you receive this message, your WhatsApp integration is working correctly! ✅\n\n";
            $testMessage .= "Date: " . now()->format('d M Y, H:i') . "\n";
            $testMessage .= "_Powered by Point of Sales_";

            $result = $whatsappService->sendMessage(
                $request->phone_number,
                $testMessage
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Pesan test berhasil dikirim! Cek WhatsApp Anda.',
                    'data' => $result['data'] ?? null,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengirim pesan: ' . ($result['error'] ?? 'Unknown error'),
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test Email connection
     */
    public function testEmail(Request $request)
    {
        $request->validate([
            'email_address' => ['required', 'email'],
        ]);

        $setting = PaymentSetting::first();

        if (!$setting || !$setting->email_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Email belum diaktifkan. Aktifkan dan simpan konfigurasi terlebih dahulu.',
            ], 400);
        }

        try {
            $emailService = app(\App\Services\Email\EmailService::class);
            $result = $emailService->testConnection($request->email_address);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Email test berhasil dikirim! Cek inbox Anda.',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengirim email test. Periksa konfigurasi email Anda.',
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
