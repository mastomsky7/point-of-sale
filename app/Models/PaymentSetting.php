<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    use HasFactory;

    public const GATEWAY_MIDTRANS = 'midtrans';
    public const GATEWAY_XENDIT = 'xendit';

    protected $fillable = [
        'default_gateway',
        'midtrans_enabled',
        'midtrans_server_key',
        'midtrans_client_key',
        'midtrans_production',
        'xendit_enabled',
        'xendit_secret_key',
        'xendit_public_key',
        'xendit_production',
        'whatsapp_enabled',
        'whatsapp_api_url',
        'whatsapp_api_token',
        'whatsapp_phone_number',
        'whatsapp_business_id',
        'whatsapp_send_receipt',
        'whatsapp_send_appointment',
        'whatsapp_send_reminder',
        'whatsapp_reminder_hours',
        // Email settings
        'email_enabled',
        'email_driver',
        'email_host',
        'email_port',
        'email_username',
        'email_password',
        'email_encryption',
        'email_from_address',
        'email_from_name',
        'email_send_receipt',
        'email_receipt_message',
        // SMS settings - F2
        'sms_enabled',
        'sms_provider',
        'sms_twilio_sid',
        'sms_twilio_token',
        'sms_twilio_from',
        'sms_vonage_key',
        'sms_vonage_secret',
        'sms_vonage_from',
        'sms_zenziva_userkey',
        'sms_zenziva_passkey',
        'sms_custom_api_url',
        'sms_custom_api_key',
        'sms_custom_sender_id',
        'sms_send_receipt',
        'sms_send_appointment',
        'sms_send_reminder',
        // Google Calendar settings - F3
        'google_calendar_enabled',
        'google_calendar_client_id',
        'google_calendar_client_secret',
        'google_calendar_refresh_token',
        'google_calendar_id',
        'google_calendar_auto_sync',
        'google_calendar_send_notifications',
    ];

    protected $casts = [
        'midtrans_enabled' => 'boolean',
        'midtrans_production' => 'boolean',
        'xendit_enabled' => 'boolean',
        'xendit_production' => 'boolean',
        'whatsapp_enabled' => 'boolean',
        'whatsapp_send_receipt' => 'boolean',
        'whatsapp_send_appointment' => 'boolean',
        'whatsapp_send_reminder' => 'boolean',
        'whatsapp_reminder_hours' => 'integer',
        // Email casts
        'email_enabled' => 'boolean',
        'email_port' => 'integer',
        'email_send_receipt' => 'boolean',
        // SMS casts - F2
        'sms_enabled' => 'boolean',
        'sms_send_receipt' => 'boolean',
        'sms_send_appointment' => 'boolean',
        'sms_send_reminder' => 'boolean',
        // Google Calendar casts - F3
        'google_calendar_enabled' => 'boolean',
        'google_calendar_auto_sync' => 'boolean',
        'google_calendar_send_notifications' => 'boolean',
    ];

    public function enabledGateways(): array
    {
        $gateways = [];

        if ($this->isGatewayReady(self::GATEWAY_MIDTRANS)) {
            $gateways[] = [
                'value' => self::GATEWAY_MIDTRANS,
                'label' => 'Midtrans',
                'description' => 'Bagikan tautan pembayaran Snap Midtrans ke pelanggan.',
            ];
        }

        if ($this->isGatewayReady(self::GATEWAY_XENDIT)) {
            $gateways[] = [
                'value' => self::GATEWAY_XENDIT,
                'label' => 'Xendit',
                'description' => 'Buat invoice otomatis menggunakan Xendit.',
            ];
        }

        return $gateways;
    }

    public function isGatewayReady(string $gateway): bool
    {
        return match ($gateway) {
            self::GATEWAY_MIDTRANS => $this->midtrans_enabled
                && filled($this->midtrans_server_key)
                && filled($this->midtrans_client_key),
            self::GATEWAY_XENDIT => $this->xendit_enabled
                && filled($this->xendit_secret_key)
                && filled($this->xendit_public_key),
            default => false,
        };
    }

    public function midtransConfig(): array
    {
        return [
            'enabled' => $this->isGatewayReady(self::GATEWAY_MIDTRANS),
            'server_key' => $this->midtrans_server_key,
            'client_key' => $this->midtrans_client_key,
            'is_production' => $this->midtrans_production,
        ];
    }

    public function xenditConfig(): array
    {
        return [
            'enabled' => $this->isGatewayReady(self::GATEWAY_XENDIT),
            'secret_key' => $this->xendit_secret_key,
            'public_key' => $this->xendit_public_key,
            'is_production' => $this->xendit_production,
        ];
    }

    /**
     * Check if email is ready to use
     */
    public function isEmailReady(): bool
    {
        return $this->email_enabled
            && filled($this->email_host)
            && filled($this->email_username)
            && filled($this->email_password)
            && filled($this->email_from_address);
    }

    /**
     * Get email configuration array
     */
    public function emailConfig(): array
    {
        return [
            'driver' => $this->email_driver ?? 'smtp',
            'host' => $this->email_host,
            'port' => $this->email_port ?? 587,
            'username' => $this->email_username,
            'password' => $this->email_password,
            'encryption' => $this->email_encryption ?? 'tls',
            'from' => [
                'address' => $this->email_from_address,
                'name' => $this->email_from_name ?? config('app.name'),
            ],
        ];
    }

    /**
     * F2: Check if SMS is ready to use
     */
    public function isSmsReady(): bool
    {
        if (!$this->sms_enabled || !$this->sms_provider) {
            return false;
        }

        return match ($this->sms_provider) {
            'twilio' => filled($this->sms_twilio_sid) && filled($this->sms_twilio_token) && filled($this->sms_twilio_from),
            'vonage' => filled($this->sms_vonage_key) && filled($this->sms_vonage_secret) && filled($this->sms_vonage_from),
            'zenziva' => filled($this->sms_zenziva_userkey) && filled($this->sms_zenziva_passkey),
            'custom' => filled($this->sms_custom_api_url) && filled($this->sms_custom_api_key),
            default => false,
        };
    }

    /**
     * F2: Get SMS configuration array
     */
    public function smsConfig(): array
    {
        return [
            'provider' => $this->sms_provider,
            'twilio' => [
                'sid' => $this->sms_twilio_sid,
                'token' => $this->sms_twilio_token,
                'from' => $this->sms_twilio_from,
            ],
            'vonage' => [
                'key' => $this->sms_vonage_key,
                'secret' => $this->sms_vonage_secret,
                'from' => $this->sms_vonage_from,
            ],
            'zenziva' => [
                'userkey' => $this->sms_zenziva_userkey,
                'passkey' => $this->sms_zenziva_passkey,
            ],
            'custom' => [
                'api_url' => $this->sms_custom_api_url,
                'api_key' => $this->sms_custom_api_key,
                'sender_id' => $this->sms_custom_sender_id,
            ],
        ];
    }

    /**
     * F3: Check if Google Calendar is ready to use
     */
    public function isGoogleCalendarReady(): bool
    {
        return $this->google_calendar_enabled
            && filled($this->google_calendar_client_id)
            && filled($this->google_calendar_client_secret)
            && filled($this->google_calendar_refresh_token);
    }

    /**
     * F3: Get Google Calendar configuration array
     */
    public function googleCalendarConfig(): array
    {
        return [
            'client_id' => $this->google_calendar_client_id,
            'client_secret' => $this->google_calendar_client_secret,
            'refresh_token' => $this->google_calendar_refresh_token,
            'calendar_id' => $this->google_calendar_id ?? 'primary',
            'auto_sync' => $this->google_calendar_auto_sync,
            'send_notifications' => $this->google_calendar_send_notifications,
        ];
    }
}
