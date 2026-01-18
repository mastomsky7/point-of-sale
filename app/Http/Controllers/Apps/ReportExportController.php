<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\Customer;
use App\Exports\SalesReportExport;
use App\Exports\ProductsReportExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportExportController extends Controller
{
    /**
     * Export sales report
     */
    public function sales(Request $request)
    {
        $format = $request->input('format', 'excel'); // excel or pdf
        $filters = $this->getFilters($request);

        $data = $this->getSalesData($filters);

        if ($format === 'pdf') {
            return $this->exportSalesPDF($data, $filters);
        }

        return $this->exportSalesExcel($data, $filters);
    }

    /**
     * Export products report
     */
    public function products(Request $request)
    {
        $format = $request->input('format', 'excel');
        $filters = $this->getFilters($request);

        $data = $this->getProductsData($filters);

        if ($format === 'pdf') {
            return $this->exportProductsPDF($data, $filters);
        }

        return $this->exportProductsExcel($data, $filters);
    }

    /**
     * Export customers report
     */
    public function customers(Request $request)
    {
        $format = $request->input('format', 'excel');
        $filters = $this->getFilters($request);

        $data = $this->getCustomersData($filters);

        if ($format === 'pdf') {
            return $this->exportCustomersPDF($data, $filters);
        }

        return $this->exportCustomersExcel($data, $filters);
    }

    /**
     * Export profit report
     */
    public function profit(Request $request)
    {
        $format = $request->input('format', 'excel');
        $filters = $this->getFilters($request);

        $data = $this->getProfitData($filters);

        if ($format === 'pdf') {
            return $this->exportProfitPDF($data, $filters);
        }

        return $this->exportProfitExcel($data, $filters);
    }

    /**
     * Export tax report
     */
    public function tax(Request $request)
    {
        $format = $request->input('format', 'excel');
        $filters = $this->getFilters($request);

        $data = $this->getTaxData($filters);

        if ($format === 'pdf') {
            return $this->exportTaxPDF($data, $filters);
        }

        return $this->exportTaxExcel($data, $filters);
    }

    /**
     * Export inventory report
     */
    public function inventory(Request $request)
    {
        $format = $request->input('format', 'excel');
        $filters = $this->getFilters($request);

        $data = $this->getInventoryData($filters);

        if ($format === 'pdf') {
            return $this->exportInventoryPDF($data, $filters);
        }

        return $this->exportInventoryExcel($data, $filters);
    }

    // ========== DATA METHODS ==========

    /**
     * Get sales data
     */
    private function getSalesData(array $filters): array
    {
        $query = Transaction::with(['customer', 'user', 'details.product'])
            ->whereBetween('created_at', [$filters['date_from'], $filters['date_to']]);

        if ($filters['payment_method']) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if ($filters['customer_id']) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if ($filters['status']) {
            $query->where('status', $filters['status']);
        }

        $transactions = $query->get();

        return $transactions->map(function ($transaction) {
            return [
                'date' => $transaction->created_at->format('Y-m-d H:i'),
                'invoice' => $transaction->invoice_number,
                'customer' => $transaction->customer->name ?? 'Walk-in',
                'items' => $transaction->details->count(),
                'subtotal' => number_format($transaction->sub_total, 0, ',', '.'),
                'tax' => number_format($transaction->tax ?? 0, 0, ',', '.'),
                'discount' => number_format($transaction->discount ?? 0, 0, ',', '.'),
                'total' => number_format($transaction->grand_total, 0, ',', '.'),
                'payment_method' => ucfirst($transaction->payment_method),
                'status' => ucfirst($transaction->status ?? 'completed'),
                'cashier' => $transaction->user->name ?? '-',
            ];
        })->toArray();
    }

    /**
     * Get products data
     */
    private function getProductsData(array $filters): array
    {
        $query = Product::with(['category']);

        if ($filters['category_id']) {
            $query->where('category_id', $filters['category_id']);
        }

        $products = $query->get();

        return $products->map(function ($product) use ($filters) {
            // Get sales data for this product in date range
            $sales = \DB::table('transaction_details')
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transaction_details.product_id', $product->id)
                ->whereBetween('transactions.created_at', [$filters['date_from'], $filters['date_to']])
                ->select(
                    \DB::raw('SUM(transaction_details.qty) as total_qty'),
                    \DB::raw('SUM(transaction_details.qty * transaction_details.price) as total_revenue')
                )
                ->first();

            $profitMargin = $product->price > 0
                ? (($product->price - ($product->cost ?? 0)) / $product->price) * 100
                : 0;

            return [
                'product_name' => $product->name,
                'sku' => $product->sku ?? '-',
                'category' => $product->category->name ?? '-',
                'stock' => $product->stock ?? 0,
                'price' => number_format($product->price, 0, ',', '.'),
                'cost' => number_format($product->cost ?? 0, 0, ',', '.'),
                'profit_margin' => number_format($profitMargin, 2) . '%',
                'units_sold' => $sales->total_qty ?? 0,
                'revenue' => number_format($sales->total_revenue ?? 0, 0, ',', '.'),
                'status' => $product->stock > 0 ? 'In Stock' : 'Out of Stock',
            ];
        })->toArray();
    }

    /**
     * Get customers data
     */
    private function getCustomersData(array $filters): array
    {
        $customers = Customer::withCount(['transactions' => function ($query) use ($filters) {
            $query->whereBetween('created_at', [$filters['date_from'], $filters['date_to']]);
        }])
        ->withSum(['transactions' => function ($query) use ($filters) {
            $query->whereBetween('created_at', [$filters['date_from'], $filters['date_to']]);
        }], 'grand_total')
        ->get();

        return $customers->map(function ($customer) {
            $avgOrderValue = $customer->transactions_count > 0
                ? $customer->transactions_sum_grand_total / $customer->transactions_count
                : 0;

            return [
                'customer_name' => $customer->name,
                'email_phone' => $customer->email ?? $customer->phone ?? '-',
                'total_transactions' => $customer->transactions_count,
                'total_spend' => number_format($customer->transactions_sum_grand_total ?? 0, 0, ',', '.'),
                'avg_order_value' => number_format($avgOrderValue, 0, ',', '.'),
                'last_purchase' => $customer->transactions()->latest()->first()?->created_at?->format('Y-m-d') ?? '-',
                'member_since' => $customer->created_at->format('Y-m-d'),
                'loyalty_points' => $customer->loyalty_points ?? 0,
            ];
        })->toArray();
    }

    /**
     * Get profit data
     */
    private function getProfitData(array $filters): array
    {
        $transactions = Transaction::with('details.product')
            ->whereBetween('created_at', [$filters['date_from'], $filters['date_to']])
            ->get();

        $data = [];
        $currentDate = Carbon::parse($filters['date_from']);
        $endDate = Carbon::parse($filters['date_to']);

        while ($currentDate <= $endDate) {
            $dayTransactions = $transactions->filter(function ($transaction) use ($currentDate) {
                return $transaction->created_at->isSameDay($currentDate);
            });

            $revenue = $dayTransactions->sum('grand_total');
            $cogs = $dayTransactions->sum(function ($transaction) {
                return $transaction->details->sum(function ($detail) {
                    return ($detail->product->cost ?? 0) * $detail->qty;
                });
            });

            $grossProfit = $revenue - $cogs;
            $profitMargin = $revenue > 0 ? ($grossProfit / $revenue) * 100 : 0;

            $data[] = [
                'period' => $currentDate->format('Y-m-d'),
                'revenue' => number_format($revenue, 0, ',', '.'),
                'cogs' => number_format($cogs, 0, ',', '.'),
                'gross_profit' => number_format($grossProfit, 0, ',', '.'),
                'operating_expenses' => '0', // TODO: Implement expenses tracking
                'net_profit' => number_format($grossProfit, 0, ',', '.'),
                'profit_margin' => number_format($profitMargin, 2) . '%',
            ];

            $currentDate->addDay();
        }

        return $data;
    }

    /**
     * Get tax data
     */
    private function getTaxData(array $filters): array
    {
        $transactions = Transaction::with('customer')
            ->whereBetween('created_at', [$filters['date_from'], $filters['date_to']])
            ->whereNotNull('tax')
            ->where('tax', '>', 0)
            ->get();

        return $transactions->map(function ($transaction) {
            $taxableAmount = $transaction->sub_total;
            $taxRate = $transaction->tax_rate ?? 10; // Default 10%
            $taxAmount = $transaction->tax ?? 0;

            return [
                'date' => $transaction->created_at->format('Y-m-d'),
                'invoice' => $transaction->invoice_number,
                'customer' => $transaction->customer->name ?? 'Walk-in',
                'taxable_amount' => number_format($taxableAmount, 0, ',', '.'),
                'tax_rate' => $taxRate . '%',
                'tax_amount' => number_format($taxAmount, 0, ',', '.'),
                'total_with_tax' => number_format($transaction->grand_total, 0, ',', '.'),
            ];
        })->toArray();
    }

    /**
     * Get inventory data
     */
    private function getInventoryData(array $filters): array
    {
        $products = Product::with('category')->get();

        return $products->map(function ($product) use ($filters) {
            // Calculate stock movements in date range
            $sold = \DB::table('transaction_details')
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transaction_details.product_id', $product->id)
                ->whereBetween('transactions.created_at', [$filters['date_from'], $filters['date_to']])
                ->sum('transaction_details.qty');

            $openingStock = $product->stock + $sold; // Rough estimate
            $closingStock = $product->stock;
            $stockValue = $closingStock * ($product->cost ?? 0);

            return [
                'product' => $product->name,
                'sku' => $product->sku ?? '-',
                'category' => $product->category->name ?? '-',
                'opening_stock' => $openingStock,
                'received' => 0, // TODO: Implement purchase/receiving tracking
                'sold' => $sold,
                'adjusted' => 0, // TODO: Implement stock adjustments
                'closing_stock' => $closingStock,
                'stock_value' => number_format($stockValue, 0, ',', '.'),
            ];
        })->toArray();
    }

    // ========== EXCEL EXPORT METHODS ==========

    private function exportSalesExcel(array $data, array $filters)
    {
        $filename = 'sales-report-' . now()->format('Y-m-d-His') . '.xlsx';
        return Excel::download(new SalesReportExport($data), $filename);
    }

    private function exportProductsExcel(array $data, array $filters)
    {
        $filename = 'products-report-' . now()->format('Y-m-d-His') . '.xlsx';
        return Excel::download(new ProductsReportExport($data), $filename);
    }

    private function exportCustomersExcel(array $data, array $filters)
    {
        $filename = 'customers-report-' . now()->format('Y-m-d-His') . '.xlsx';

        // Create simple export inline
        return Excel::download(new class($data) implements
            \Maatwebsite\Excel\Concerns\FromCollection,
            \Maatwebsite\Excel\Concerns\WithHeadings
        {
            private $data;

            public function __construct($data) {
                $this->data = $data;
            }

            public function collection() {
                return collect($this->data);
            }

            public function headings(): array {
                return ['Customer Name', 'Email/Phone', 'Total Transactions', 'Total Spend', 'Avg Order Value', 'Last Purchase', 'Member Since', 'Loyalty Points'];
            }
        }, $filename);
    }

    private function exportProfitExcel(array $data, array $filters)
    {
        $filename = 'profit-report-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new class($data) implements
            \Maatwebsite\Excel\Concerns\FromCollection,
            \Maatwebsite\Excel\Concerns\WithHeadings
        {
            private $data;

            public function __construct($data) {
                $this->data = $data;
            }

            public function collection() {
                return collect($this->data);
            }

            public function headings(): array {
                return ['Period', 'Revenue', 'COGS', 'Gross Profit', 'Operating Expenses', 'Net Profit', 'Profit Margin'];
            }
        }, $filename);
    }

    private function exportTaxExcel(array $data, array $filters)
    {
        $filename = 'tax-report-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new class($data) implements
            \Maatwebsite\Excel\Concerns\FromCollection,
            \Maatwebsite\Excel\Concerns\WithHeadings
        {
            private $data;

            public function __construct($data) {
                $this->data = $data;
            }

            public function collection() {
                return collect($this->data);
            }

            public function headings(): array {
                return ['Date', 'Invoice', 'Customer', 'Taxable Amount', 'Tax Rate', 'Tax Amount', 'Total with Tax'];
            }
        }, $filename);
    }

    private function exportInventoryExcel(array $data, array $filters)
    {
        $filename = 'inventory-report-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new class($data) implements
            \Maatwebsite\Excel\Concerns\FromCollection,
            \Maatwebsite\Excel\Concerns\WithHeadings
        {
            private $data;

            public function __construct($data) {
                $this->data = $data;
            }

            public function collection() {
                return collect($this->data);
            }

            public function headings(): array {
                return ['Product', 'SKU', 'Category', 'Opening Stock', 'Received', 'Sold', 'Adjusted', 'Closing Stock', 'Stock Value'];
            }
        }, $filename);
    }

    // ========== PDF EXPORT METHODS ==========

    private function exportSalesPDF(array $data, array $filters)
    {
        $pdf = PDF::loadView('reports.sales-pdf', [
            'data' => $data,
            'filters' => $filters,
            'title' => 'Sales Report',
            'period' => $filters['date_from'] . ' to ' . $filters['date_to'],
        ]);

        return $pdf->download('sales-report-' . now()->format('Y-m-d') . '.pdf');
    }

    private function exportProductsPDF(array $data, array $filters)
    {
        $pdf = PDF::loadView('reports.products-pdf', [
            'data' => $data,
            'filters' => $filters,
            'title' => 'Products Report',
            'period' => $filters['date_from'] . ' to ' . $filters['date_to'],
        ]);

        return $pdf->download('products-report-' . now()->format('Y-m-d') . '.pdf');
    }

    private function exportCustomersPDF(array $data, array $filters)
    {
        $pdf = PDF::loadView('reports.customers-pdf', [
            'data' => $data,
            'filters' => $filters,
            'title' => 'Customers Report',
            'period' => $filters['date_from'] . ' to ' . $filters['date_to'],
        ]);

        return $pdf->download('customers-report-' . now()->format('Y-m-d') . '.pdf');
    }

    private function exportProfitPDF(array $data, array $filters)
    {
        $pdf = PDF::loadView('reports.profit-pdf', [
            'data' => $data,
            'filters' => $filters,
            'title' => 'Profit & Loss Report',
            'period' => $filters['date_from'] . ' to ' . $filters['date_to'],
        ]);

        return $pdf->download('profit-report-' . now()->format('Y-m-d') . '.pdf');
    }

    private function exportTaxPDF(array $data, array $filters)
    {
        $pdf = PDF::loadView('reports.tax-pdf', [
            'data' => $data,
            'filters' => $filters,
            'title' => 'Tax Report',
            'period' => $filters['date_from'] . ' to ' . $filters['date_to'],
        ]);

        return $pdf->download('tax-report-' . now()->format('Y-m-d') . '.pdf');
    }

    private function exportInventoryPDF(array $data, array $filters)
    {
        $pdf = PDF::loadView('reports.inventory-pdf', [
            'data' => $data,
            'filters' => $filters,
            'title' => 'Inventory Report',
            'period' => $filters['date_from'] . ' to ' . $filters['date_to'],
        ]);

        return $pdf->download('inventory-report-' . now()->format('Y-m-d') . '.pdf');
    }

    // ========== HELPER METHODS ==========

    private function getFilters(Request $request): array
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->input('date_to', now()->format('Y-m-d'));

        return [
            'date_from' => $dateFrom . ' 00:00:00',
            'date_to' => $dateTo . ' 23:59:59',
            'category_id' => $request->input('category_id'),
            'product_id' => $request->input('product_id'),
            'customer_id' => $request->input('customer_id'),
            'payment_method' => $request->input('payment_method'),
            'status' => $request->input('status'),
        ];
    }
}
