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
        .text-right { text-align: right; }
        .text-center { text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Period: {{ $period }}</p>
        <p>Generated: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
    </div>

    @php
        $totalCustomers = count($data);
        $totalSpend = 0;
        $totalTransactions = 0;
        $totalPoints = 0;
        foreach($data as $row) {
            $totalSpend += isset($row['total_spend']) ? (is_numeric($row['total_spend']) ? $row['total_spend'] : (int) str_replace('.', '', $row['total_spend'])) : 0;
            $totalTransactions += $row['total_transactions'] ?? 0;
            $totalPoints += $row['loyalty_points'] ?? 0;
        }
        $avgOrderValue = $totalCustomers > 0 ? $totalSpend / $totalCustomers : 0;
    @endphp

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Customers:</span> {{ number_format($totalCustomers) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Spend:</span> Rp {{ number_format($totalSpend, 0, ',', '.') }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Transactions:</span> {{ number_format($totalTransactions) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Avg Order Value:</span> Rp {{ number_format($avgOrderValue, 0, ',', '.') }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Customer</th>
                <th>Email/Phone</th>
                <th class="text-center">Transactions</th>
                <th class="text-right">Total Spend</th>
                <th class="text-right">Avg Order</th>
                <th class="text-center">Last Purchase</th>
                <th class="text-center">Member Since</th>
                <th class="text-right">Points</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
            <tr>
                <td>{{ $row['name'] ?? $row['customer_name'] ?? '-' }}</td>
                <td>{{ $row['email'] ?? $row['phone'] ?? '-' }}</td>
                <td class="text-center">{{ number_format($row['total_transactions'] ?? 0) }}</td>
                <td class="text-right">Rp {{ is_numeric($row['total_spend'] ?? 0) ? number_format($row['total_spend'], 0, ',', '.') : $row['total_spend'] }}</td>
                <td class="text-right">Rp {{ is_numeric($row['avg_order_value'] ?? 0) ? number_format($row['avg_order_value'], 0, ',', '.') : ($row['avg_order_value'] ?? '0') }}</td>
                <td class="text-center">{{ $row['last_purchase_date'] ?? '-' }}</td>
                <td class="text-center">{{ $row['member_since'] ?? ($row['created_at'] ?? '-') }}</td>
                <td class="text-right">{{ number_format($row['loyalty_points'] ?? 0) }}</td>
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
