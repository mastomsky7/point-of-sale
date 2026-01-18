<?php

namespace App\Exports;

use App\Models\TransactionDetail;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProfitReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return TransactionDetail::whereBetween('transaction_details.created_at', [$this->startDate, $this->endDate])
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->where('transactions.payment_status', 'paid')
            ->whereNotNull('transaction_details.product_id')
            ->select(
                'products.title',
                DB::raw('SUM(transaction_details.qty) as total_qty'),
                DB::raw('AVG(products.buy_price) as avg_buy_price'),
                DB::raw('AVG(transaction_details.price) as avg_sell_price'),
                DB::raw('SUM((transaction_details.price - products.buy_price) * transaction_details.qty) as total_profit'),
                DB::raw('AVG((transaction_details.price - products.buy_price) / NULLIF(transaction_details.price, 0) * 100) as profit_margin')
            )
            ->groupBy('products.id', 'products.title')
            ->orderByDesc('total_profit')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Nama Produk',
            'Qty Terjual',
            'Harga Beli (Rata-rata)',
            'Harga Jual (Rata-rata)',
            'Total Profit',
            'Margin Profit (%)',
        ];
    }

    public function map($product): array
    {
        return [
            $product->title,
            $product->total_qty,
            $product->avg_buy_price,
            $product->avg_sell_price,
            $product->total_profit,
            number_format($product->profit_margin, 2),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Laporan Profit';
    }
}
