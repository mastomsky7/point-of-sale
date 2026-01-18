<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #10B981;
        }
        .success-icon {
            width: 80px;
            height: 80px;
            background-color: #10B981;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: white;
        }
        .header h1 {
            color: #10B981;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 0;
        }
        .success-box {
            background-color: #D1FAE5;
            border-left: 4px solid #10B981;
            padding: 15px;
            margin: 20px 0;
        }
        .success-box h3 {
            margin-top: 0;
            color: #047857;
        }
        .details {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .details-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-row:last-child {
            border-bottom: none;
        }
        .details-label {
            font-weight: 600;
            color: #6b7280;
        }
        .details-value {
            color: #111827;
            font-weight: 500;
            text-align: right;
        }
        .amount-paid {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .amount-paid h2 {
            margin: 0;
            font-size: 36px;
        }
        .amount-paid p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .button {
            display: inline-block;
            background-color: #10B981;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background-color: #059669;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .invoice-id {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            text-align: center;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Payment Successful!</h1>
        </div>

        <div class="content">
            <p>Hello {{ $client->company_name ?? $client->name }},</p>

            <p>Thank you for your payment! Your <strong>{{ $plan->name }}</strong> subscription has been successfully renewed.</p>

            <div class="amount-paid">
                <h2>
                    @if($currency === 'IDR')
                        Rp {{ number_format($amount, 0, ',', '.') }}
                    @else
                        {{ $currency }} {{ number_format($amount, 2) }}
                    @endif
                </h2>
                <p>Payment Received</p>
            </div>

            <div class="success-box">
                <h3>Your subscription is now active</h3>
                <p style="margin: 5px 0 0 0;">All services and features are available. Your next billing date is <strong>{{ $nextBillingDate->format('F j, Y') }}</strong>.</p>
            </div>

            <div class="details">
                <h3 style="margin-top: 0; color: #111827;">Payment Details</h3>
                <div class="details-row">
                    <span class="details-label">Transaction ID:</span>
                    <span class="details-value">{{ $transactionId }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Payment Date:</span>
                    <span class="details-value">{{ $paidAt->format('F j, Y g:i A') }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Payment Method:</span>
                    <span class="details-value">{{ ucfirst($payment->payment_method) }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Plan:</span>
                    <span class="details-value">{{ $plan->name }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Billing Cycle:</span>
                    <span class="details-value">{{ ucfirst($plan->billing_interval) }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Next Billing Date:</span>
                    <span class="details-value">{{ $nextBillingDate->format('F j, Y') }}</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/dashboard" class="button">View Dashboard</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                <strong>What's included in your plan?</strong><br>
                @if($plan->max_stores)
                    • Up to {{ $plan->max_stores }} store{{ $plan->max_stores > 1 ? 's' : '' }}<br>
                @endif
                @if($plan->max_products)
                    • Up to {{ $plan->max_products }} products<br>
                @endif
                @if($plan->max_transactions_per_month)
                    • Up to {{ number_format($plan->max_transactions_per_month) }} transactions per month<br>
                @endif
                • Full access to all features<br>
                • Priority support
            </p>

            <p style="font-size: 14px; color: #6b7280;">
                A detailed invoice has been sent to your email address. You can also download it from your account dashboard.
            </p>
        </div>

        <div class="footer">
            <p>Thank you for choosing {{ config('app.name') }}!</p>
            <p>If you have any questions about your subscription, please don't hesitate to contact us.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
