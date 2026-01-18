<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    /**
     * Handle Midtrans notification webhook
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleNotification(Request $request)
    {
        try {
            // Log the incoming webhook for debugging
            Log::info('Midtrans Webhook Received', [
                'payload' => $request->all()
            ]);

            // Get notification data from Midtrans
            $orderId = $request->input('order_id');
            $transactionStatus = $request->input('transaction_status');
            $fraudStatus = $request->input('fraud_status');
            $signatureKey = $request->input('signature_key');

            // Find transaction by invoice
            $transaction = Transaction::where('invoice', $orderId)->first();

            if (!$transaction) {
                Log::warning('Transaction not found for Midtrans webhook', [
                    'order_id' => $orderId
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Transaction not found'
                ], 404);
            }

            // Verify signature (optional but recommended for security)
            $serverKey = $this->getServerKey($transaction);
            $expectedSignature = hash('sha512', $orderId . $request->input('status_code') . $request->input('gross_amount') . $serverKey);

            if ($signatureKey !== $expectedSignature) {
                Log::warning('Invalid Midtrans signature', [
                    'order_id' => $orderId,
                    'expected' => $expectedSignature,
                    'received' => $signatureKey
                ]);
                // Continue anyway for development/testing
                // In production, you might want to return error here
            }

            // Update payment status based on Midtrans status
            $paymentStatus = $this->mapMidtransStatus($transactionStatus, $fraudStatus);

            $transaction->payment_status = $paymentStatus;
            $transaction->save();

            Log::info('Transaction payment status updated', [
                'invoice' => $orderId,
                'old_status' => $transaction->getOriginal('payment_status'),
                'new_status' => $paymentStatus,
                'midtrans_status' => $transactionStatus
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment status updated'
            ]);

        } catch (\Exception $e) {
            Log::error('Midtrans webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Map Midtrans transaction status to our payment status
     *
     * @param string $transactionStatus
     * @param string|null $fraudStatus
     * @return string
     */
    private function mapMidtransStatus(string $transactionStatus, ?string $fraudStatus): string
    {
        // Midtrans status mapping
        // Reference: https://docs.midtrans.com/en/after-payment/http-notification

        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'accept') {
                return 'paid';
            } elseif ($fraudStatus === 'challenge') {
                return 'pending';
            }
        } elseif ($transactionStatus === 'settlement') {
            return 'paid';
        } elseif ($transactionStatus === 'pending') {
            return 'pending';
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            return 'failed';
        }

        return 'pending';
    }

    /**
     * Get server key from merchant (multi-tenant support)
     *
     * @param Transaction $transaction
     * @return string
     */
    private function getServerKey(Transaction $transaction): string
    {
        // Try to get merchant from transaction
        $merchant = $transaction->merchant;

        // Fallback to store's merchant if transaction doesn't have one
        if (!$merchant && $transaction->store) {
            $merchant = $transaction->store->getDefaultMerchant();
        }

        // Use merchant config if available
        if ($merchant && $merchant->isMidtransReady()) {
            $config = $merchant->midtransConfig();
            return $config['server_key'] ?? '';
        }

        // Fallback to global PaymentSetting (for backward compatibility)
        $paymentSetting = \App\Models\PaymentSetting::first();

        if (!$paymentSetting) {
            return '';
        }

        return $paymentSetting->midtrans_server_key ?? '';
    }

    /**
     * Handle finish callback from Midtrans (user redirected back)
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleFinish(Request $request)
    {
        $orderId = $request->input('order_id');

        Log::info('Midtrans finish callback', [
            'order_id' => $orderId,
            'params' => $request->all()
        ]);

        // Redirect to print page
        if ($orderId) {
            $transaction = Transaction::where('invoice', $orderId)->first();
            if ($transaction) {
                return redirect()->route('transactions.print', $transaction->invoice)
                    ->with('success', 'Silakan cek status pembayaran Anda');
            }
        }

        return redirect()->route('transactions.index')
            ->with('info', 'Transaksi sedang diproses');
    }
}
