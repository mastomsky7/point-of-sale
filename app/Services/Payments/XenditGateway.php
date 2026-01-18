<?php

namespace App\Services\Payments;

use App\Exceptions\PaymentGatewayException;
use App\Models\Transaction;
use App\Models\Appointment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XenditGateway
{
    public function createInvoice(Transaction $transaction, array $config): array
    {
        if (!($config['enabled'] ?? false)) {
            throw new PaymentGatewayException('Xendit tidak aktif atau belum dikonfigurasi.');
        }

        $customer = $transaction->customer;

        $response = Http::withBasicAuth($config['secret_key'], '')
            ->post('https://api.xendit.co/v2/invoices', [
                'external_id' => $transaction->invoice,
                'amount' => (int) $transaction->grand_total,
                'description' => 'Pembayaran transaksi #' . $transaction->invoice,
                'customer' => [
                    'given_names' => optional($customer)->name ?? 'Customer',
                    'email' => optional($customer)->email ?? config('mail.from.address'),
                    'mobile_number' => optional($customer)->phone,
                ],
                'success_redirect_url' => route('transactions.print', $transaction->invoice),
            ]);

        if ($response->failed()) {
            throw new PaymentGatewayException(
                'Xendit error: ' . $response->json('message', $response->body())
            );
        }

        return [
            'reference' => $response->json('id'),
            'payment_url' => $response->json('invoice_url'),
            'raw' => $response->json(),
        ];
    }

    /**
     * F4: Create invoice for appointment deposit
     */
    public function createAppointmentInvoice(Appointment $appointment, array $config): array
    {
        if (!($config['enabled'] ?? false)) {
            throw new PaymentGatewayException('Xendit tidak aktif atau belum dikonfigurasi.');
        }

        $customer = $appointment->customer;
        $amount = $appointment->deposit > 0 ? $appointment->deposit : $appointment->total_price;

        $response = Http::withBasicAuth($config['secret_key'], '')
            ->post('https://api.xendit.co/v2/invoices', [
                'external_id' => 'APT-' . $appointment->appointment_number,
                'amount' => (int) $amount,
                'description' => ($appointment->deposit > 0 ? 'Deposit' : 'Payment') . ' for Appointment #' . $appointment->appointment_number,
                'customer' => [
                    'given_names' => optional($customer)->name ?? 'Customer',
                    'email' => optional($customer)->email ?? config('mail.from.address'),
                    'mobile_number' => optional($customer)->phone,
                ],
                'success_redirect_url' => route('appointments.show', $appointment->id),
                'items' => [
                    [
                        'name' => $appointment->deposit > 0 ? 'Deposit Appointment' : 'Appointment Payment',
                        'quantity' => 1,
                        'price' => (int) $amount,
                    ],
                ],
            ]);

        if ($response->failed()) {
            Log::error('Xendit appointment invoice error', [
                'appointment_id' => $appointment->id,
                'response' => $response->json()
            ]);

            throw new PaymentGatewayException(
                'Xendit error: ' . $response->json('message', $response->body())
            );
        }

        return [
            'reference' => $response->json('id'),
            'payment_url' => $response->json('invoice_url'),
            'raw' => $response->json(),
        ];
    }

    /**
     * F4: Check invoice status from Xendit
     */
    public function checkInvoiceStatus(string $invoiceId, array $config): array
    {
        if (!($config['enabled'] ?? false)) {
            throw new PaymentGatewayException('Xendit tidak aktif atau belum dikonfigurasi.');
        }

        try {
            $response = Http::withBasicAuth($config['secret_key'], '')
                ->get("https://api.xendit.co/v2/invoices/{$invoiceId}");

            if ($response->failed()) {
                Log::warning('Xendit status check failed', [
                    'invoice_id' => $invoiceId,
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);

                throw new PaymentGatewayException(
                    'Failed to check invoice status: ' . $response->json('message', 'Unknown error')
                );
            }

            $data = $response->json();

            return [
                'invoice_id' => $data['id'] ?? $invoiceId,
                'external_id' => $data['external_id'] ?? null,
                'status' => $data['status'] ?? 'unknown',
                'amount' => $data['amount'] ?? 0,
                'paid_amount' => $data['paid_amount'] ?? 0,
                'payment_method' => $data['payment_method'] ?? null,
                'paid_at' => $data['paid_at'] ?? null,
                'is_paid' => ($data['status'] ?? '') === 'PAID',
                'raw' => $data,
            ];

        } catch (\Exception $e) {
            Log::error('Xendit status check exception', [
                'invoice_id' => $invoiceId,
                'error' => $e->getMessage()
            ]);

            throw new PaymentGatewayException('Error checking invoice status: ' . $e->getMessage());
        }
    }
}
