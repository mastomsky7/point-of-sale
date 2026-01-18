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
        .total-row { background: #edf2f7; font-weight: bold; }
        .highlight { background: #fef5e7; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Period: {{ $period }}</p>
        <p>Generated: {{ $generated_at ?? now()->format('Y-m-d H:i:s') }}</p>
    </div>

    @php
        $totalTransactions = count($data);
        $totalTaxableAmount = 0;
        $totalTaxAmount = 0;
        $totalWithTax = 0;

        foreach($data as $row) {
            $totalTaxableAmount += isset($row['taxable_amount']) ? (is_numeric($row['taxable_amount']) ? $row['taxable_amount'] : (int) str_replace('.', '', $row['taxable_amount'])) : 0;
            $totalTaxAmount += isset($row['tax_amount']) ? (is_numeric($row['tax_amount']) ? $row['tax_amount'] : (int) str_replace('.', '', $row['tax_amount'])) : 0;
            $totalWithTax += isset($row['total_with_tax']) ? (is_numeric($row['total_with_tax']) ? $row['total_with_tax'] : (int) str_replace('.', '', $row['total_with_tax'])) : 0;
        }

        $avgTaxRate = $totalTaxableAmount > 0 ? (($totalTaxAmount / $totalTaxableAmount) * 100) : 0;
    @endphp

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Transactions:</span> {{ number_format($totalTransactions) }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Taxable Amount:</span> Rp {{ number_format($totalTaxableAmount, 0, ',', '.') }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Tax Collected:</span> Rp {{ number_format($totalTaxAmount, 0, ',', '.') }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Total with Tax:</span> Rp {{ number_format($totalWithTax, 0, ',', '.') }}
        </div>
        <div class="summary-item">
            <span class="summary-label">Avg Tax Rate:</span> {{ number_format($avgTaxRate, 2) }}%
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th class="text-right">Taxable Amount</th>
                <th class="text-center">Tax Rate</th>
                <th class="text-right">Tax Amount</th>
                <th class="text-right">Total with Tax</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
            @php
                $taxableAmount = isset($row['taxable_amount']) ? (is_numeric($row['taxable_amount']) ? $row['taxable_amount'] : (int) str_replace('.', '', $row['taxable_amount'])) : 0;
                $taxAmount = isset($row['tax_amount']) ? (is_numeric($row['tax_amount']) ? $row['tax_amount'] : (int) str_replace('.', '', $row['tax_amount'])) : 0;
                $totalAmount = isset($row['total_with_tax']) ? (is_numeric($row['total_with_tax']) ? $row['total_with_tax'] : (int) str_replace('.', '', $row['total_with_tax'])) : 0;
                $taxRate = $row['tax_rate'] ?? ($taxableAmount > 0 ? (($taxAmount / $taxableAmount) * 100) : 0);
            @endphp
            <tr>
                <td>{{ $row['date'] ?? '-' }}</td>
                <td>{{ $row['invoice'] ?? $row['invoice_number'] ?? '-' }}</td>
                <td>{{ $row['customer'] ?? $row['customer_name'] ?? '-' }}</td>
                <td class="text-right">Rp {{ number_format($taxableAmount, 0, ',', '.') }}</td>
                <td class="text-center">{{ number_format($taxRate, 2) }}%</td>
                <td class="text-right">Rp {{ number_format($taxAmount, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($totalAmount, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="3">TOTAL</td>
                <td class="text-right">Rp {{ number_format($totalTaxableAmount, 0, ',', '.') }}</td>
                <td class="text-center">{{ number_format($avgTaxRate, 2) }}%</td>
                <td class="text-right">Rp {{ number_format($totalTaxAmount, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($totalWithTax, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 30px; padding: 15px; background: #fef5e7; border-left: 4px solid #f39c12; border-radius: 4px;">
        <p style="margin: 0; font-weight: bold;">Tax Compliance Note:</p>
        <p style="margin: 10px 0 0;">This report is for internal use only. Please consult with your tax advisor for official tax filing requirements.</p>
    </div>

    <div class="footer">
        <p>This is a computer-generated report. No signature required.</p>
        <p>&copy; {{ now()->year }} Point of Sales System. All rights reserved.</p>
    </div>
</body>
</html>
