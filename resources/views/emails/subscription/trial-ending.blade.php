<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trial Ending Soon</title>
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
            border-bottom: 2px solid #F59E0B;
        }
        .header h1 {
            color: #F59E0B;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 0;
        }
        .trial-box {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
        }
        .trial-box h3 {
            margin-top: 0;
            color: #92400E;
        }
        .countdown {
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .countdown h2 {
            margin: 0;
            font-size: 64px;
            font-weight: bold;
        }
        .countdown p {
            margin: 10px 0 0 0;
            font-size: 18px;
        }
        .features-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .feature-item {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #4F46E5;
        }
        .feature-item h4 {
            margin: 0 0 5px 0;
            color: #4F46E5;
            font-size: 16px;
        }
        .feature-item p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
        }
        .pricing-box {
            background-color: #EEF2FF;
            border: 2px solid #4F46E5;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .pricing-box .price {
            font-size: 48px;
            font-weight: bold;
            color: #4F46E5;
            margin: 10px 0;
        }
        .pricing-box .period {
            color: #6b7280;
            font-size: 16px;
        }
        .button {
            display: inline-block;
            background-color: #4F46E5;
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
            background-color: #4338CA;
        }
        .button-secondary {
            display: inline-block;
            background-color: #ffffff;
            color: #4F46E5;
            border: 2px solid #4F46E5;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px;
            text-align: center;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .benefits-list {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 15px 15px 15px 35px;
            margin: 20px 0;
        }
        .benefits-list li {
            margin: 10px 0;
            color: #111827;
        }
        .benefits-list li::marker {
            color: #10B981;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Trial is Ending Soon</h1>
        </div>

        <div class="content">
            <p>Hello {{ $client->company_name ?? $client->name }},</p>

            <p>We hope you've been enjoying your <strong>{{ $plan->name }}</strong> trial! Your trial period is coming to an end soon.</p>

            <div class="countdown">
                <h2>{{ $daysRemaining }}</h2>
                <p>{{ $daysRemaining === 1 ? 'DAY' : 'DAYS' }} REMAINING</p>
            </div>

            <div class="trial-box">
                <h3>Trial Ends: {{ $trialEndsAt->format('F j, Y') }}</h3>
                <p style="margin: 5px 0 0 0;">
                    After your trial ends, you'll need an active subscription to continue using all features and services.
                </p>
            </div>

            <h3 style="color: #111827; text-align: center;">Continue Enjoying These Features</h3>

            <ul class="benefits-list">
                @if($plan->max_stores)
                    <li>Manage up to {{ $plan->max_stores }} store{{ $plan->max_stores > 1 ? 's' : '' }}</li>
                @endif
                @if($plan->max_products)
                    <li>Unlimited product catalog (up to {{ number_format($plan->max_products) }} products)</li>
                @endif
                @if($plan->max_transactions_per_month)
                    <li>Process up to {{ number_format($plan->max_transactions_per_month) }} transactions per month</li>
                @endif
                <li>Advanced reporting and analytics</li>
                <li>Real-time inventory tracking</li>
                <li>Customer management system</li>
                <li>Multiple payment gateway integrations</li>
                <li>Priority customer support</li>
            </ul>

            <div class="pricing-box">
                <p style="margin: 0; color: #6b7280; font-weight: 600;">Continue with {{ $plan->name }}</p>
                <div class="price">
                    @if($currency === 'IDR')
                        Rp {{ number_format($amount, 0, ',', '.') }}
                    @else
                        {{ $currency }} {{ number_format($amount, 2) }}
                    @endif
                </div>
                <p class="period">per {{ $plan->billing_interval }}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ config('app.url') }}/dashboard/subscription" class="button">Subscribe Now</a>
                <br>
                <a href="{{ config('app.url') }}/dashboard/subscription/plans" class="button-secondary">View All Plans</a>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center;">
                <strong>What happens if I don't subscribe?</strong><br>
                After your trial ends on {{ $trialEndsAt->format('F j, Y') }}, you'll lose access to:
            </p>
            <ul style="font-size: 14px; color: #991B1B; text-align: left; max-width: 400px; margin: 10px auto;">
                <li>POS system and transaction processing</li>
                <li>Inventory management features</li>
                <li>Customer data and reports</li>
                <li>All store management tools</li>
            </ul>

            <p style="font-size: 14px; color: #6b7280; background-color: #EEF2FF; padding: 15px; border-radius: 6px;">
                💡 <strong>Pro Tip:</strong> Subscribe now to ensure uninterrupted service. Your subscription will start immediately after your trial ends, so you won't experience any downtime!
            </p>

            <p style="font-size: 14px; color: #6b7280;">
                Have questions about our plans or need help choosing the right one for your business? Our team is here to help!
            </p>
        </div>

        <div class="footer">
            <p>Thank you for trying {{ config('app.name') }}!</p>
            <p>Questions? Contact our support team anytime.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
