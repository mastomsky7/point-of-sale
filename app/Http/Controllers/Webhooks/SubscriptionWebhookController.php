<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\Subscriptions\SubscriptionPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SubscriptionWebhookController extends Controller
{
    protected SubscriptionPaymentService $paymentService;

    public function __construct(SubscriptionPaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Handle Midtrans webhook
     */
    public function midtrans(Request $request)
    {
        try {
            Log::info('Midtrans webhook received', [
                'payload' => $request->all(),
            ]);

            // Verify signature
            $serverKey = config('services.midtrans.server_key');
            $hashed = hash('sha512', $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

            if ($hashed !== $request->signature_key) {
                Log::warning('Invalid Midtrans webhook signature');
                return response()->json(['message' => 'Invalid signature'], 403);
            }

            $transactionId = $request->order_id;
            $transactionStatus = $request->transaction_status;
            $fraudStatus = $request->fraud_status ?? null;

            // Handle different statuses
            if ($transactionStatus === 'capture') {
                if ($fraudStatus === 'accept') {
                    $this->paymentService->handlePaymentSuccess($transactionId, $request->all());
                }
            } elseif ($transactionStatus === 'settlement') {
                $this->paymentService->handlePaymentSuccess($transactionId, $request->all());
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
                $this->paymentService->handlePaymentFailure(
                    $transactionId,
                    "Payment {$transactionStatus}"
                );
            } elseif ($transactionStatus === 'pending') {
                // Payment still pending, do nothing
                Log::info('Payment still pending', ['transaction_id' => $transactionId]);
            }

            return response()->json(['message' => 'OK'], 200);

        } catch (\Exception $e) {
            Log::error('Midtrans webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['message' => 'Error processing webhook'], 500);
        }
    }

    /**
     * Handle Xendit webhook
     */
    public function xendit(Request $request)
    {
        try {
            Log::info('Xendit webhook received', [
                'payload' => $request->all(),
            ]);

            // Verify callback token
            $callbackToken = $request->header('X-CALLBACK-TOKEN');
            $expectedToken = config('services.xendit.callback_token');

            if ($callbackToken !== $expectedToken) {
                Log::warning('Invalid Xendit webhook token');
                return response()->json(['message' => 'Invalid token'], 403);
            }

            $transactionId = $request->external_id;
            $status = $request->status;

            // Handle different statuses
            if ($status === 'PAID') {
                $this->paymentService->handlePaymentSuccess($transactionId, $request->all());
            } elseif (in_array($status, ['EXPIRED', 'FAILED'])) {
                $this->paymentService->handlePaymentFailure(
                    $transactionId,
                    "Payment {$status}"
                );
            }

            return response()->json(['message' => 'OK'], 200);

        } catch (\Exception $e) {
            Log::error('Xendit webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['message' => 'Error processing webhook'], 500);
        }
    }

    /**
     * Handle generic webhook (for testing)
     */
    public function generic(Request $request)
    {
        try {
            Log::info('Generic webhook received', [
                'payload' => $request->all(),
            ]);

            $transactionId = $request->input('transaction_id');
            $status = $request->input('status');

            if ($status === 'success') {
                $this->paymentService->handlePaymentSuccess($transactionId, $request->all());
            } else {
                $this->paymentService->handlePaymentFailure(
                    $transactionId,
                    $request->input('reason', 'Payment failed')
                );
            }

            return response()->json(['message' => 'OK'], 200);

        } catch (\Exception $e) {
            Log::error('Generic webhook error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Error'], 500);
        }
    }
}
