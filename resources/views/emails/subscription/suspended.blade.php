<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Suspended</title>
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
            border-bottom: 2px solid #DC2626;
        }
        .error-icon {
            width: 80px;
            height: 80px;
            background-color: #DC2626;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: white;
        }
        .header h1 {
            color: #DC2626;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 0;
        }
        .critical-box {
            background-color: #FEE2E2;
            border: 2px solid #DC2626;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .critical-box h3 {
            margin-top: 0;
            color: #991B1B;
            font-size: 20px;
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
            background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
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
            background-color: #DC2626;
            color: #ffffff;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
            font-weight: 600;
            font-size: 16px;
        }
        .button:hover {
            background-color: #991B1B;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .consequences-list {
            background-color: #FEF2F2;
            border-radius: 8px;
            padding: 15px 15px 15px 35px;
            margin: 20px 0;
        }
        .consequences-list li {
            margin: 10px 0;
            color: #991B1B;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="error-icon">✕</div>
            <h1>Subscription Suspended</h1>
        </div>

        <div class="content">
            <p>Hello {{ $client->company_name ?? $client->name }},</p>

            <div class="critical-box">
                <h3>🚨 Your subscription has been suspended</h3>
                <p style="margin: 10px 0 0 0; color: #6b7280;">
                    Due to multiple failed payment attempts, your access has been temporarily restricted.
                </p>
            </div>

            <p>Your <strong>{{ $plan->name }}</strong> subscription was suspended on <strong>{{ $suspendedAt->format('F j, Y g:i A') }}</strong> after <strong>{{ $failureCount }}</strong> failed payment attempts.</p>

            <div class="amount-due">
                <h2>
                    @if($currency === 'IDR')
                        Rp {{ number_format($amount, 0, ',', '.') }}
                    @else
                        {{ $currency }} {{ number_format($amount, 2) }}
                    @endif
                </h2>
                <p>Outstanding Balance</p>
            </div>

            <div class="details">
                <h3 style="margin-top: 0; color: #111827;">Suspension Details</h3>
                <div class="details-row">
                    <span class="details-label">Plan:</span>
                    <span class="details-value">{{ $plan->name }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Suspended Date:</span>
                    <span class="details-value">{{ $suspendedAt->format('F j, Y g:i A') }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Failed Attempts:</span>
                    <span class="details-value" style="color: #DC2626;">{{ $failureCount }}</span>
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
            </div>

            <h3 style="color: #DC2626;">What this means for you:</h3>
            <ul class="consequences-list">
                <li>All store access has been disabled</li>
                <li>Store licenses have been suspended</li>
                <li>POS system is currently unavailable</li>
                <li>No transactions can be processed</li>
                <li>Reports and data are temporarily inaccessible</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ config('app.url') }}/dashboard/settings/payment" class="button">Restore Access Now</a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
                <strong>How to restore your service:</strong>
            </p>
            <ol style="font-size: 14px; color: #6b7280;">
                <li>Update your payment method with valid payment information</li>
                <li>Clear the outstanding balance shown above</li>
                <li>Your subscription will be automatically reactivated</li>
                <li>All services will be restored immediately</li>
            </ol>

            <p style="font-size: 14px; color: #991B1B; font-weight: 600;">
                ⚠ Important: If payment is not received within 30 days, your account data may be permanently deleted.
            </p>

            <p style="font-size: 14px; color: #6b7280;">
                If you're experiencing payment issues or have questions, please contact our support team immediately. We're here to help you resolve this as quickly as possible.
            </p>
        </div>

        <div class="footer">
            <p><strong>Need immediate assistance?</strong></p>
            <p>Contact our support team - we're here to help!</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
