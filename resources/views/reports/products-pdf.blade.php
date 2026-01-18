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
        .status-badge { padding: 3px 8px; border-radius: 3px; font-size: 10px; }
        .status-active { background: #48bb78; color: white; }
        .status-inactive { background: #f56565; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Period: {{ $period }}</p>
        <p>Generated: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
    </div>

    @php
        $totalRevenue = 0;
        $totalStock = 0;
        $totalSold = 0;
        foreach($data as $row) {
            $totalRevenue += isset($row['revenue']) ? (is_numeric($row['revenue']) ? $row['revenue'] : (int) str_replace('.', '', $row['revenue'])) : 0;
            $totalStock += $row['stock'] ?? 0;
            $totalSold += $row['units_sold'] ?? 0;
        }
    @endphp

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Products:</span> {{ count($data) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Stock:</span> {{ number_format($totalStock) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Units Sold:</span> {{ number_format($totalSold) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Revenue:</span> Rp {{ number_format($totalRevenue, 0, ',', '.') }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th class="text-right">Stock</th>
                <th class="text-right">Price</th>
                <th class="text-right">Cost</th>
                <th class="text-right">Margin</th>
                <th class="text-right">Sold</th>
                <th class="text-right">Revenue</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
            <tr>
                <td>{{ $row['name'] ?? $row['product_name'] ?? '-' }}</td>
                <td>{{ $row['sku'] ?? '-' }}</td>
                <td>{{ $row['category'] ?? '-' }}</td>
                <td class="text-right">{{ number_format($row['stock'] ?? 0) }}</td>
                <td class="text-right">Rp {{ number_format($row['price'] ?? 0, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($row['cost'] ?? 0, 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($row['profit_margin'] ?? 0, 1) }}%</td>
                <td class="text-right">{{ number_format($row['units_sold'] ?? 0) }}</td>
                <td class="text-right">Rp {{ is_numeric($row['revenue'] ?? 0) ? number_format($row['revenue'], 0, ',', '.') : $row['revenue'] }}</td>
                <td>
                    @if(($row['status'] ?? 'active') === 'active')
                        <span class="status-badge status-active">Active</span>
                    @else
                        <span class="status-badge status-inactive">Inactive</span>
                    @endif
                </td>
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
