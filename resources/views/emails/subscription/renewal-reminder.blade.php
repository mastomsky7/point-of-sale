<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Renewal Reminder</title>
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
            border-bottom: 2px solid #4F46E5;
        }
        .header h1 {
            color: #4F46E5;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 0;
        }
        .info-box {
            background-color: #EEF2FF;
            border-left: 4px solid #4F46E5;
            padding: 15px;
            margin: 20px 0;
        }
        .info-box h3 {
            margin-top: 0;
            color: #4F46E5;
        }
        .details {
            margin: 15px 0;
        }
        .details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .details-label {
            font-weight: 600;
            color: #6b7280;
        }
        .details-value {
            color: #111827;
            font-weight: 500;
        }
        .amount {
            font-size: 32px;
            font-weight: bold;
            color: #4F46E5;
            text-align: center;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #4F46E5;
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background-color: #4338CA;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .countdown {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .countdown h2 {
            margin: 0;
            font-size: 48px;
        }
        .countdown p {
            margin: 5px 0 0 0;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Subscription Renewal Reminder</h1>
        </div>

        <div class="content">
            <p>Hello {{ $client->company_name ?? $client->name }},</p>

            <p>This is a friendly reminder that your <strong>{{ $plan->name }}</strong> subscription will renew soon.</p>

            <div class="countdown">
                <h2>{{ $daysUntilRenewal }}</h2>
                <p>{{ $daysUntilRenewal === 1 ? 'DAY' : 'DAYS' }} UNTIL RENEWAL</p>
            </div>

            <div class="info-box">
                <h3>Renewal Details</h3>
                <div class="details">
                    <div class="details-row">
                        <span class="details-label">Plan:</span>
                        <span class="details-value">{{ $plan->name }}</span>
                    </div>
                    <div class="details-row">
                        <span class="details-label">Renewal Date:</span>
                        <span class="details-value">{{ $renewalDate->format('F j, Y') }}</span>
                    </div>
                    <div class="details-row">
                        <span class="details-label">Billing Cycle:</span>
                        <span class="details-value">{{ ucfirst($plan->billing_interval) }}</span>
                    </div>
                </div>
            </div>

            <div class="amount">
                @if($currency === 'IDR')
                    Rp {{ number_format($amount, 0, ',', '.') }}
                @else
                    {{ $currency }} {{ number_format($amount, 2) }}
                @endif
            </div>

            <p style="text-align: center; color: #6b7280;">
                The amount above will be charged to your payment method on {{ $renewalDate->format('F j, Y') }}.
            </p>

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/dashboard" class="button">View Subscription Details</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                <strong>What happens next?</strong><br>
                Your subscription will automatically renew on {{ $renewalDate->format('F j, Y') }}. You will receive an invoice once the payment is processed successfully.
            </p>

            <p style="font-size: 14px; color: #6b7280;">
                If you wish to cancel your subscription or update your payment method, please visit your account dashboard before the renewal date.
            </p>
        </div>

        <div class="footer">
            <p>This is an automated message from your Point of Sales system.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
