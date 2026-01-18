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
        th { background: #4a5568; color: white; padding: 10px; text-align: left; font-size: 11px; }
        td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
        tr:hover { background: #f7fafc; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 10px; }
        .summary { margin: 20px 0; padding: 15px; background: #f7fafc; border-radius: 5px; }
        .summary-item { display: inline-block; margin-right: 30px; }
        .summary-label { font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { background: #edf2f7; font-weight: bold; }
        .stock-low { color: #ed8936; font-weight: bold; }
        .stock-out { color: #f56565; font-weight: bold; }
        .stock-ok { color: #48bb78; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Period: {{ $period }}</p>
        <p>Generated: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
    </div>

    @php
        $totalProducts = count($data);
        $totalOpeningStock = 0;
        $totalReceived = 0;
        $totalSold = 0;
        $totalAdjusted = 0;
        $totalClosingStock = 0;
        $totalStockValue = 0;

        foreach($data as $row) {
            $totalOpeningStock += $row['opening_stock'] ?? 0;
            $totalReceived += $row['received'] ?? 0;
            $totalSold += $row['sold'] ?? 0;
            $totalAdjusted += $row['adjusted'] ?? 0;
            $totalClosingStock += $row['closing_stock'] ?? 0;
            $value = isset($row['stock_value']) ? (is_numeric($row['stock_value']) ? $row['stock_value'] : (int) str_replace('.', '', $row['stock_value'])) : 0;
            $totalStockValue += $value;
        }
    @endphp

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Products:</span> {{ number_format($totalProducts) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Opening Stock:</span> {{ number_format($totalOpeningStock) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Units Sold:</span> {{ number_format($totalSold) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Closing Stock:</span> {{ number_format($totalClosingStock) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Stock Value:</span> Rp {{ number_format($totalStockValue, 0, ',', '.') }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th class="text-right">Opening</th>
                <th class="text-right">Received</th>
                <th class="text-right">Sold</th>
                <th class="text-right">Adjusted</th>
                <th class="text-right">Closing</th>
                <th class="text-right">Stock Value</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
            @php
                $closingStock = $row['closing_stock'] ?? 0;
                $stockValue = isset($row['stock_value']) ? (is_numeric($row['stock_value']) ? $row['stock_value'] : (int) str_replace('.', '', $row['stock_value'])) : 0;
                $stockClass = 'stock-ok';
                if ($closingStock <= 0) {
                    $stockClass = 'stock-out';
                } elseif ($closingStock <= 10) {
                    $stockClass = 'stock-low';
                }
            @endphp
            <tr>
                <td>{{ $row['product'] ?? $row['product_name'] ?? $row['name'] ?? '-' }}</td>
                <td>{{ $row['sku'] ?? '-' }}</td>
                <td>{{ $row['category'] ?? '-' }}</td>
                <td class="text-right">{{ number_format($row['opening_stock'] ?? 0) }}</td>
                <td class="text-right">{{ number_format($row['received'] ?? 0) }}</td>
                <td class="text-right">{{ number_format($row['sold'] ?? 0) }}</td>
                <td class="text-right">{{ number_format($row['adjusted'] ?? 0) }}</td>
                <td class="text-right {{ $stockClass }}">{{ number_format($closingStock) }}</td>
                <td class="text-right">Rp {{ number_format($stockValue, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="3">TOTAL</td>
                <td class="text-right">{{ number_format($totalOpeningStock) }}</td>
                <td class="text-right">{{ number_format($totalReceived) }}</td>
                <td class="text-right">{{ number_format($totalSold) }}</td>
                <td class="text-right">{{ number_format($totalAdjusted) }}</td>
                <td class="text-right">{{ number_format($totalClosingStock) }}</td>
                <td class="text-right">Rp {{ number_format($totalStockValue, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 20px;">
        <p style="margin: 5px 0;">
            <span style="color: #48bb78;">●</span> Healthy Stock (> 10 units)
            &nbsp;&nbsp;
            <span style="color: #ed8936;">●</span> Low Stock (≤ 10 units)
            &nbsp;&nbsp;
            <span style="color: #f56565;">●</span> Out of Stock
        </p>
    </div>

    <div class="footer">
        <p>This is a computer-generated report. No signature required.</p>
        <p>&copy; {{ now()->year }} Point of Sales System. All rights reserved.</p>
    </div>
</body>
</html>
