<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #4a5568; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:hover { background: #f7fafc; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 10px; }
        .summary { margin: 20px 0; padding: 15px; background: #f7fafc; border-radius: 5px; }
        .summary-item { display: inline-block; margin-right: 30px; }
        .summary-label { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Period: {{ $period }}</p>
        <p>Generated: {{ now()->format('Y-m-d H:i:s') }}</p>
    </div>

    @php
        $totalRevenue = 0;
        foreach($data as $row) {
            $totalRevenue += (int) str_replace('.', '', $row['total']);
        }
    @endphp

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Transactions:</span> {{ count($data) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Revenue:</span> Rp {{ number_format($totalRevenue, 0, ',', '.') }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Cashier</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
            <tr>
                <td>{{ $row['date'] }}</td>
                <td>{{ $row['invoice'] }}</td>
                <td>{{ $row['customer'] }}</td>
                <td>{{ $row['items'] }}</td>
                <td>Rp {{ $row['total'] }}</td>
                <td>{{ $row['payment_method'] }}</td>
                <td>{{ $row['cashier'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This is a computer-generated report. No signature required.</p>
        <p>&copy; {{ now()->year }} Point of Sales System. All rights reserved.</p>
    </div>
</body>
</html>
