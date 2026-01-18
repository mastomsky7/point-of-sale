<?php

namespace App\Services\Payments;

use App\Exceptions\PaymentGatewayException;
use App\Models\PaymentSetting;
use App\Models\PaymentMerchant;
use App\Models\Transaction;
use App\Models\Appointment;

class PaymentGatewayManager
{
    public function __construct(
        private MidtransGateway $midtransGateway,
        private XenditGateway $xenditGateway
    ) {
    }

    /**
     * Create payment using merchant config (multi-tenant support)
     */
    public function createPaymentWithMerchant(Transaction $transaction, string $gateway, PaymentMerchant $merchant): array
    {
        return match ($gateway) {
            PaymentSetting::GATEWAY_MIDTRANS => $this->midtransGateway->createCharge($transaction, $merchant->midtransConfig()),
            PaymentSetting::GATEWAY_XENDIT => $this->xenditGateway->createInvoice($transaction, $merchant->xenditConfig()),
            default => throw new PaymentGatewayException("Gateway {$gateway} belum didukung."),
        };
    }

    /**
     * Legacy method - uses global PaymentSetting (backward compatibility)
     */
    public function createPayment(Transaction $transaction, string $gateway, PaymentSetting $setting): array
    {
        return match ($gateway) {
            PaymentSetting::GATEWAY_MIDTRANS => $this->midtransGateway->createCharge($transaction, $setting->midtransConfig()),
            PaymentSetting::GATEWAY_XENDIT => $this->xenditGateway->createInvoice($transaction, $setting->xenditConfig()),
            default => throw new PaymentGatewayException("Gateway {$gateway} belum didukung."),
        };
    }

    /**
     * Create payment for appointment using merchant config
     */
    public function createAppointmentPaymentWithMerchant(Appointment $appointment, string $gateway, PaymentMerchant $merchant): array
    {
        return match ($gateway) {
            PaymentSetting::GATEWAY_MIDTRANS => $this->midtransGateway->createAppointmentCharge($appointment, $merchant->midtransConfig()),
            PaymentSetting::GATEWAY_XENDIT => $this->xenditGateway->createAppointmentInvoice($appointment, $merchant->xenditConfig()),
            default => throw new PaymentGatewayException("Gateway {$gateway} belum didukung."),
        };
    }

    /**
     * Legacy: Create payment for appointment deposit
     */
    public function createAppointmentPayment(Appointment $appointment, string $gateway, PaymentSetting $setting): array
    {
        return match ($gateway) {
            PaymentSetting::GATEWAY_MIDTRANS => $this->midtransGateway->createAppointmentCharge($appointment, $setting->midtransConfig()),
            PaymentSetting::GATEWAY_XENDIT => $this->xenditGateway->createAppointmentInvoice($appointment, $setting->xenditConfig()),
            default => throw new PaymentGatewayException("Gateway {$gateway} belum didukung."),
        };
    }

    /**
     * Check payment status using merchant config
     */
    public function checkPaymentStatusWithMerchant(string $orderId, string $gateway, PaymentMerchant $merchant): array
    {
        return match ($gateway) {
            PaymentSetting::GATEWAY_MIDTRANS => $this->midtransGateway->checkStatus($orderId, $merchant->midtransConfig()),
            PaymentSetting::GATEWAY_XENDIT => $this->xenditGateway->checkInvoiceStatus($orderId, $merchant->xenditConfig()),
            default => throw new PaymentGatewayException("Gateway {$gateway} belum didukung."),
        };
    }

    /**
     * Legacy: Check payment status
     */
    public function checkPaymentStatus(string $orderId, string $gateway, PaymentSetting $setting): array
    {
        return match ($gateway) {
            PaymentSetting::GATEWAY_MIDTRANS => $this->midtransGateway->checkStatus($orderId, $setting->midtransConfig()),
            PaymentSetting::GATEWAY_XENDIT => $this->xenditGateway->checkInvoiceStatus($orderId, $setting->xenditConfig()),
            default => throw new PaymentGatewayException("Gateway {$gateway} belum didukung."),
        };
    }
}
