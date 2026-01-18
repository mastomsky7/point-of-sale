<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed</title>
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
            border-bottom: 2px solid #EF4444;
        }
        .warning-icon {
            width: 80px;
            height: 80px;
            background-color: #EF4444;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: white;
        }
        .header h1 {
            color: #EF4444;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 0;
        }
        .alert-box {
            background-color: #FEE2E2;
            border-left: 4px solid #EF4444;
            padding: 15px;
            margin: 20px 0;
        }
        .alert-box h3 {
            margin-top: 0;
            color: #991B1B;
        }
        .warning-box {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-box h3 {
            margin-top: 0;
            color: #92400E;
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
        .amount-due {
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .amount-due h2 {
            margin: 0;
            font-size: 36px;
        }
        .amount-due p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .button {
            display: inline-block;
            background-color: #EF4444;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
            font-weight: 600;
        }
        .button:hover {
            background-color: #DC2626;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .failure-badge {
            display: inline-block;
            background-color: #FEE2E2;
            color: #991B1B;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="warning-icon">!</div>
            <h1>Payment Failed</h1>
            @if($failureCount > 1)
                <div class="failure-badge">Attempt {{ $failureCount }} of 5</div>
            @endif
        </div>

        <div class="content">
            <p>Hello {{ $client->company_name ?? $client->name }},</p>

            <p>We were unable to process your subscription payment for <strong>{{ $plan->name }}</strong>.</p>

            <div class="amount-due">
                <h2>
                    @if($currency === 'IDR')
                        Rp {{ number_format($amount, 0, ',', '.') }}
                    @else
                        {{ $currency }} {{ number_format($amount, 2) }}
                    @endif
                </h2>
                <p>Amount Due</p>
            </div>

            <div class="alert-box">
                <h3>Action Required</h3>
                <p style="margin: 5px 0 0 0;"><strong>Reason:</strong> {{ $failureReason ?? 'Payment could not be processed' }}</p>
            </div>

            @if($suspensionWarning)
                <div class="warning-box">
                    <h3>⚠ Suspension Warning</h3>
                    <p style="margin: 5px 0 0 0;">
                        Your account has <strong>{{ 5 - $failureCount }}</strong> payment attempt(s) remaining.
                        After 5 failed attempts, your subscription will be suspended and access to all services will be restricted.
                    </p>
                </div>
            @endif

            <div class="details">
                <h3 style="margin-top: 0; color: #111827;">Payment Details</h3>
                <div class="details-row">
                    <span class="details-label">Plan:</span>
                    <span class="details-value">{{ $plan->name }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Amount Due:</span>
                    <span class="details-value">
                        @if($currency === 'IDR')
                            Rp {{ number_format($amount, 0, ',', '.') }}
                        @else
                            {{ $currency }} {{ number_format($amount, 2) }}
                        @endif
                    </span>
                </div>
                <div class="details-row">
                    <span class="details-label">Failed Attempts:</span>
                    <span class="details-value" style="color: #EF4444;">{{ $failureCount }} of 5</span>
                </div>
                @if($retryDate)
                <div class="details-row">
                    <span class="details-label">Next Retry:</span>
                    <span class="details-value">{{ $retryDate->format('F j, Y') }}</span>
                </div>
                @endif
            </div>

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/dashboard/settings/payment" class="button">Update Payment Method</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                <strong>What you should do:</strong>
            </p>
            <ul style="font-size: 14px; color: #6b7280;">
                <li>Check that your payment method has sufficient funds</li>
                <li>Verify your payment method details are correct</li>
                <li>Update your payment method if necessary</li>
                <li>Contact your bank if you need assistance</li>
            </ul>

            <p style="font-size: 14px; color: #6b7280;">
                <strong>Next steps:</strong><br>
                @if($failureCount < 3)
                    We will automatically retry the payment. You can also manually retry the payment from your dashboard.
                @elseif($failureCount < 5)
                    Your account is marked as "past due". Please update your payment method to avoid service suspension after {{ 5 - $failureCount }} more failed attempt(s).
                @else
                    Please update your payment method immediately to restore service.
                @endif
            </p>
        </div>

        <div class="footer">
            <p>Need help? Contact our support team for assistance.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
