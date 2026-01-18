<?php

namespace App\Services\Payments;

use App\Exceptions\PaymentGatewayException;
use App\Models\Transaction;
use App\Models\Appointment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransGateway
{
    public function createCharge(Transaction $transaction, array $config): array
    {
        if (!($config['enabled'] ?? false)) {
            throw new PaymentGatewayException('Midtrans tidak aktif atau belum dikonfigurasi.');
        }

        $endpoint = $config['is_production'] ?? false
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $customer = $transaction->customer;

        $payload = [
            'transaction_details' => [
                'order_id' => $transaction->invoice,
                'gross_amount' => (int) $transaction->grand_total,
            ],
            'customer_details' => [
                'first_name' => optional($customer)->name ?? 'Customer',
                'email' => optional($customer)->email ?? config('mail.from.address'),
                'phone' => optional($customer)->phone,
            ],
            'callbacks' => [
                'finish' => route('webhooks.midtrans.finish'),
            ],
        ];

        // Add notification URL if app URL is configured
        if (config('app.url')) {
            $payload['callbacks']['notification_url'] = route('webhooks.midtrans.notification');
        }

        $response = Http::withBasicAuth($config['server_key'], '')
            ->post($endpoint, $payload);

        if ($response->failed()) {
            throw new PaymentGatewayException(
                'Midtrans error: ' . $response->json('status_message', $response->body())
            );
        }

        return [
            'reference' => $response->json('order_id', $transaction->invoice),
            'payment_url' => $response->json('redirect_url'),
            'token' => $response->json('token'),
            'raw' => $response->json(),
        ];
    }

    /**
     * F4: Create payment charge for appointment deposit
     */
    public function createAppointmentCharge(Appointment $appointment, array $config): array
    {
        if (!($config['enabled'] ?? false)) {
            throw new PaymentGatewayException('Midtrans tidak aktif atau belum dikonfigurasi.');
        }

        $endpoint = $config['is_production'] ?? false
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $customer = $appointment->customer;
        $amount = $appointment->deposit > 0 ? $appointment->deposit : $appointment->total_price;

        $payload = [
            'transaction_details' => [
                'order_id' => 'APT-' . $appointment->appointment_number,
                'gross_amount' => (int) $amount,
            ],
            'customer_details' => [
                'first_name' => optional($customer)->name ?? 'Customer',
                'email' => optional($customer)->email ?? config('mail.from.address'),
                'phone' => optional($customer)->phone,
            ],
            'item_details' => [
                [
                    'id' => 'appointment-' . $appointment->id,
                    'price' => (int) $amount,
                    'quantity' => 1,
                    'name' => $appointment->deposit > 0 ? 'Deposit Appointment' : 'Appointment Payment',
                ],
            ],
            'callbacks' => [
                'finish' => route('appointments.show', $appointment->id),
            ],
        ];

        // Add notification URL if app URL is configured
        if (config('app.url')) {
            $payload['callbacks']['notification_url'] = route('webhooks.midtrans.notification');
        }

        $response = Http::withBasicAuth($config['server_key'], '')
            ->post($endpoint, $payload);

        if ($response->failed()) {
            Log::error('Midtrans appointment payment error', [
                'appointment_id' => $appointment->id,
                'response' => $response->json()
            ]);

            throw new PaymentGatewayException(
                'Midtrans error: ' . $response->json('status_message', $response->body())
            );
        }

        return [
            'reference' => $response->json('order_id', 'APT-' . $appointment->appointment_number),
            'payment_url' => $response->json('redirect_url'),
            'token' => $response->json('token'),
            'raw' => $response->json(),
        ];
    }

    /**
     * F4: Check payment status from Midtrans
     */
    public function checkStatus(string $orderId, array $config): array
    {
        if (!($config['enabled'] ?? false)) {
            throw new PaymentGatewayException('Midtrans tidak aktif atau belum dikonfigurasi.');
        }

        $baseUrl = $config['is_production'] ?? false
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';

        $endpoint = "{$baseUrl}/v2/{$orderId}/status";

        try {
            $response = Http::withBasicAuth($config['server_key'], '')
                ->get($endpoint);

            if ($response->failed()) {
                Log::warning('Midtrans status check failed', [
                    'order_id' => $orderId,
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);

                throw new PaymentGatewayException(
                    'Failed to check payment status: ' . $response->json('status_message', 'Unknown error')
                );
            }

            $data = $response->json();

            return [
                'order_id' => $data['order_id'] ?? $orderId,
                'transaction_status' => $data['transaction_status'] ?? 'unknown',
                'payment_type' => $data['payment_type'] ?? null,
                'gross_amount' => $data['gross_amount'] ?? 0,
                'transaction_time' => $data['transaction_time'] ?? null,
                'is_paid' => in_array($data['transaction_status'] ?? '', ['capture', 'settlement']),
                'raw' => $data,
            ];

        } catch (\Exception $e) {
            Log::error('Midtrans status check exception', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            throw new PaymentGatewayException('Error checking payment status: ' . $e->getMessage());
        }
    }
}
