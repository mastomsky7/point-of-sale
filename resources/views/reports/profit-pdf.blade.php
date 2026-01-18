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
        .positive { color: #48bb78; font-weight: bold; }
        .negative { color: #f56565; font-weight: bold; }
        .total-row { background: #edf2f7; font-weight: bold; }
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
        $totalCOGS = 0;
        $totalGrossProfit = 0;
        $totalExpenses = 0;
        $totalNetProfit = 0;

        foreach($data as $row) {
            $totalRevenue += isset($row['revenue']) ? (is_numeric($row['revenue']) ? $row['revenue'] : (int) str_replace('.', '', $row['revenue'])) : 0;
            $totalCOGS += isset($row['cogs']) ? (is_numeric($row['cogs']) ? $row['cogs'] : (int) str_replace('.', '', $row['cogs'])) : 0;
            $totalGrossProfit += isset($row['gross_profit']) ? (is_numeric($row['gross_profit']) ? $row['gross_profit'] : (int) str_replace('.', '', $row['gross_profit'])) : 0;
            $totalExpenses += isset($row['expenses']) ? (is_numeric($row['expenses']) ? $row['expenses'] : (int) str_replace('.', '', $row['expenses'])) : 0;
            $totalNetProfit += isset($row['net_profit']) ? (is_numeric($row['net_profit']) ? $row['net_profit'] : (int) str_replace('.', '', $row['net_profit'])) : 0;
        }

        $avgProfitMargin = $totalRevenue > 0 ? (($totalGrossProfit / $totalRevenue) * 100) : 0;
    @endphp

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Revenue:</span> Rp {{ number_format($totalRevenue, 0, ',', '.') }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Total COGS:</span> Rp {{ number_format($totalCOGS, 0, ',', '.') }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Gross Profit:</span>
            <span class="{{ $totalGrossProfit >= 0 ? 'positive' : 'negative' }}">
                Rp {{ number_format($totalGrossProfit, 0, ',', '.') }}
            </span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Net Profit:</span>
            <span class="{{ $totalNetProfit >= 0 ? 'positive' : 'negative' }}">
                Rp {{ number_format($totalNetProfit, 0, ',', '.') }}
            </span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Profit Margin:</span> {{ number_format($avgProfitMargin, 2) }}%
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Period</th>
                <th class="text-right">Revenue</th>
                <th class="text-right">COGS</th>
                <th class="text-right">Gross Profit</th>
                <th class="text-right">Expenses</th>
                <th class="text-right">Net Profit</th>
                <th class="text-right">Margin %</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
            @php
                $revenue = isset($row['revenue']) ? (is_numeric($row['revenue']) ? $row['revenue'] : (int) str_replace('.', '', $row['revenue'])) : 0;
                $cogs = isset($row['cogs']) ? (is_numeric($row['cogs']) ? $row['cogs'] : (int) str_replace('.', '', $row['cogs'])) : 0;
                $grossProfit = isset($row['gross_profit']) ? (is_numeric($row['gross_profit']) ? $row['gross_profit'] : (int) str_replace('.', '', $row['gross_profit'])) : 0;
                $expenses = isset($row['expenses']) ? (is_numeric($row['expenses']) ? $row['expenses'] : (int) str_replace('.', '', $row['expenses'])) : 0;
                $netProfit = isset($row['net_profit']) ? (is_numeric($row['net_profit']) ? $row['net_profit'] : (int) str_replace('.', '', $row['net_profit'])) : 0;
                $margin = isset($row['profit_margin']) ? $row['profit_margin'] : ($revenue > 0 ? (($grossProfit / $revenue) * 100) : 0);
            @endphp
            <tr>
                <td>{{ $row['period'] ?? $row['date'] ?? '-' }}</td>
                <td class="text-right">Rp {{ number_format($revenue, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($cogs, 0, ',', '.') }}</td>
                <td class="text-right {{ $grossProfit >= 0 ? 'positive' : 'negative' }}">
                    Rp {{ number_format($grossProfit, 0, ',', '.') }}
                </td>
                <td class="text-right">Rp {{ number_format($expenses, 0, ',', '.') }}</td>
                <td class="text-right {{ $netProfit >= 0 ? 'positive' : 'negative' }}">
                    Rp {{ number_format($netProfit, 0, ',', '.') }}
                </td>
                <td class="text-right">{{ number_format($margin, 2) }}%</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td>TOTAL</td>
                <td class="text-right">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($totalCOGS, 0, ',', '.') }}</td>
                <td class="text-right {{ $totalGrossProfit >= 0 ? 'positive' : 'negative' }}">
                    Rp {{ number_format($totalGrossProfit, 0, ',', '.') }}
                </td>
                <td class="text-right">Rp {{ number_format($totalExpenses, 0, ',', '.') }}</td>
                <td class="text-right {{ $totalNetProfit >= 0 ? 'positive' : 'negative' }}">
                    Rp {{ number_format($totalNetProfit, 0, ',', '.') }}
                </td>
                <td class="text-right">{{ number_format($avgProfitMargin, 2) }}%</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>This is a computer-generated report. No signature required.</p>
        <p>&copy; {{ now()->year }} Point of Sales System. All rights reserved.</p>
    </div>
</body>
</html>
