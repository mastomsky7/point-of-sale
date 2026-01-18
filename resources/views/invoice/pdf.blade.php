<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $transaction->invoice }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
        }

        .header h1 {
            font-size: 28px;
            color: #4f46e5;
            margin-bottom: 5px;
        }

        .header .business-name {
            font-size: 20px;
            font-weight: bold;
            color: #333;
        }

        .invoice-info {
            margin-bottom: 30px;
            display: table;
            width: 100%;
        }

        .invoice-info-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .invoice-info-right {
            display: table-cell;
            width: 50%;
            text-align: right;
            vertical-align: top;
        }

        .invoice-info h3 {
            font-size: 14px;
            margin-bottom: 10px;
            color: #4f46e5;
        }

        .invoice-info p {
            margin: 5px 0;
        }

        .invoice-number {
            font-size: 18px;
            font-weight: bold;
            color: #4f46e5;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        table thead {
            background-color: #4f46e5;
            color: white;
        }

        table th {
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 13px;
        }

        table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
        }

        table tbody tr:hover {
            background-color: #f9fafb;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .totals {
            margin-top: 30px;
            float: right;
            width: 300px;
        }

        .totals table {
            margin: 0;
        }

        .totals table td {
            padding: 8px;
            border: none;
        }

        .totals table tr.grand-total {
            background-color: #4f46e5;
            color: white;
            font-weight: bold;
            font-size: 16px;
        }

        .totals table tr.grand-total td {
            padding: 12px 8px;
        }

        .footer {
            clear: both;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
        }

        .footer p {
            margin: 5px 0;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }

        .badge-success {
            background-color: #10b981;
            color: white;
        }

        .badge-warning {
            background-color: #f59e0b;
            color: white;
        }

        .badge-info {
            background-color: #3b82f6;
            color: white;
        }

        .item-type {
            font-size: 10px;
            color: #6b7280;
            font-style: italic;
        }

        .service-details {
            font-size: 10px;
            color: #4f46e5;
            margin-top: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="business-name">{{ config('app.name', 'Point of Sales') }}</div>
            <h1>INVOICE</h1>
        </div>

        <div class="invoice-info">
            <div class="invoice-info-left">
                <h3>Bill To:</h3>
                <p><strong>{{ $transaction->customer->name ?? 'Walk-in Customer' }}</strong></p>
                @if($transaction->customer && $transaction->customer->phone)
                    <p>{{ $transaction->customer->phone }}</p>
                @endif
                @if($transaction->customer && $transaction->customer->address)
                    <p>{{ $transaction->customer->address }}</p>
                @endif
            </div>

            <div class="invoice-info-right">
                <p class="invoice-number">{{ $transaction->invoice }}</p>
                <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($transaction->created_at)->format('d M Y, H:i') }}</p>
                <p><strong>Cashier:</strong> {{ $transaction->cashier->name }}</p>
                <p>
                    <strong>Payment:</strong>
                    <span class="badge badge-info">{{ strtoupper($transaction->payment_method) }}</span>
                </p>
                <p>
                    <strong>Status:</strong>
                    @if($transaction->payment_status === 'paid')
                        <span class="badge badge-success">PAID</span>
                    @else
                        <span class="badge badge-warning">PENDING</span>
                    @endif
                </p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Item</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transaction->details as $index => $detail)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>
                            @if($detail->product_id)
                                <div>{{ $detail->product->title }}</div>
                                <div class="item-type">Product</div>
                            @elseif($detail->service_id)
                                <div>{{ $detail->service->name }}</div>
                                <div class="item-type">Service</div>
                                @if($detail->staff_id)
                                    <div class="service-details">
                                        Staff: {{ $detail->staff->name }}
                                        @if($detail->duration)
                                            • Duration: {{ $detail->duration }} min
                                        @endif
                                    </div>
                                @endif
                            @else
                                <div>Unknown Item</div>
                            @endif
                        </td>
                        <td class="text-center">{{ $detail->qty }}</td>
                        <td class="text-right">Rp {{ number_format($detail->price, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($detail->price * $detail->qty, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">Rp {{ number_format($transaction->details->sum(fn($d) => $d->price * $d->qty), 0, ',', '.') }}</td>
                </tr>
                @if($transaction->discount > 0)
                    <tr>
                        <td>Discount:</td>
                        <td class="text-right">-Rp {{ number_format($transaction->discount, 0, ',', '.') }}</td>
                    </tr>
                @endif
                <tr class="grand-total">
                    <td>Grand Total:</td>
                    <td class="text-right">Rp {{ number_format($transaction->grand_total, 0, ',', '.') }}</td>
                </tr>
            </table>

            @if($transaction->payment_method === 'cash')
                <table>
                    <tr>
                        <td>Cash:</td>
                        <td class="text-right">Rp {{ number_format($transaction->cash, 0, ',', '.') }}</td>
                    </tr>
                    <tr>
                        <td>Change:</td>
                        <td class="text-right">Rp {{ number_format($transaction->change, 0, ',', '.') }}</td>
                    </tr>
                </table>
            @endif
        </div>

        <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>For inquiries, please contact us through our official channels.</p>
            <p style="margin-top: 10px;">Generated on {{ now()->format('d M Y, H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
