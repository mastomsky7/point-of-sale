<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\Customer;
use App\Exports\SalesReportExport;
use App\Exports\ProductsReportExport;
use App\Exports\ProfitReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Display report dashboard
     */
    public function index()
    {
        $startDate = request('start_date', now()->startOfMonth()->toDateString());
        $endDate = request('end_date', now()->endOfMonth()->toDateString());

        // Summary Statistics
        $summary = [
            'total_sales' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->sum('grand_total'),

            'total_transactions' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->count(),

            'total_profit' => TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->join('products', 'transaction_details.product_id', '=', 'products.id')
                ->where('transactions.payment_status', 'paid')
                ->whereNotNull('transaction_details.product_id')
                ->sum(DB::raw('(transaction_details.price - products.buy_price) * transaction_details.qty')),

            'total_customers' => Customer::whereBetween('created_at', [$startDate, $endDate])
                ->count(),
        ];

        return Inertia::render('Dashboard/Reports/Index', [
            'summary' => $summary,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Sales Report
     */
    public function sales(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $groupBy = $request->input('group_by', 'day'); // day, week, month

        // Sales by period
        $salesByPeriod = $this->getSalesByPeriod($startDate, $endDate, $groupBy);

        // Sales by payment method
        $salesByPayment = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(grand_total) as total'))
            ->groupBy('payment_method')
            ->get();

        // Sales by cashier
        $salesByCashier = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->join('users', 'transactions.cashier_id', '=', 'users.id')
            ->select('users.name', DB::raw('COUNT(*) as count'), DB::raw('SUM(grand_total) as total'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->get();

        // Top selling hours
        $salesByHour = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('COUNT(*) as count'), DB::raw('SUM(grand_total) as total'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Summary
        $summary = [
            'total_sales' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->sum('grand_total'),
            'total_transactions' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->count(),
            'average_transaction' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->avg('grand_total'),
        ];

        return Inertia::render('Dashboard/Reports/SalesReport', [
            'salesByPeriod' => $salesByPeriod,
            'salesByPayment' => $salesByPayment,
            'salesByCashier' => $salesByCashier,
            'salesByHour' => $salesByHour,
            'summary' => $summary,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'groupBy' => $groupBy,
        ]);
    }

    /**
     * Product Report
     */
    public function products(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        // Best selling products
        $bestSelling = TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.payment_status', 'paid')
            ->whereNotNull('transaction_details.product_id')
            ->select(
                'products.id',
                'products.title',
                'products.barcode',
                DB::raw('SUM(transaction_details.qty) as total_qty'),
                DB::raw('SUM(transaction_details.price * transaction_details.qty) as total_sales'),
                DB::raw('COUNT(DISTINCT transaction_details.transaction_id) as transaction_count')
            )
            ->groupBy('products.id', 'products.title', 'products.barcode')
            ->orderByDesc('total_qty')
            ->limit(20)
            ->get();

        // Products by category
        $productsByCategory = TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->where('transactions.payment_status', 'paid')
            ->whereNotNull('transaction_details.product_id')
            ->select(
                'categories.name as category',
                DB::raw('SUM(transaction_details.qty) as total_qty'),
                DB::raw('SUM(transaction_details.price * transaction_details.qty) as total_sales')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_sales')
            ->get();

        // Low stock products
        $lowStock = Product::where('stock', '<=', DB::raw('COALESCE(stock_min, 5)'))
            ->select('id', 'title', 'barcode', 'stock', 'stock_min')
            ->orderBy('stock')
            ->limit(20)
            ->get();

        // Summary
        $summary = [
            'total_products_sold' => TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transactions.payment_status', 'paid')
                ->whereNotNull('transaction_details.product_id')
                ->sum('qty'),
            'unique_products' => TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transactions.payment_status', 'paid')
                ->whereNotNull('transaction_details.product_id')
                ->distinct('product_id')
                ->count('product_id'),
            'low_stock_count' => Product::where('stock', '<=', DB::raw('COALESCE(stock_min, 5)'))->count(),
        ];

        return Inertia::render('Dashboard/Reports/ProductsReport', [
            'bestSelling' => $bestSelling,
            'productsByCategory' => $productsByCategory,
            'lowStock' => $lowStock,
            'summary' => $summary,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Customer Report
     */
    public function customers(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        // Top customers
        $topCustomers = Transaction::whereBetween('transactions.created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->whereNotNull('customer_id')
            ->join('customers', 'transactions.customer_id', '=', 'customers.id')
            ->select(
                'customers.id',
                'customers.name',
                'customers.phone',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(grand_total) as total_spent'),
                DB::raw('AVG(grand_total) as avg_transaction')
            )
            ->groupBy('customers.id', 'customers.name', 'customers.phone')
            ->orderByDesc('total_spent')
            ->limit(20)
            ->get();

        // Customer acquisition
        $newCustomers = Customer::whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Customer by loyalty tier
        $customersByTier = Customer::select('loyalty_tier', DB::raw('COUNT(*) as count'))
            ->groupBy('loyalty_tier')
            ->get();

        // Summary
        $summary = [
            'total_customers' => Customer::count(),
            'new_customers' => Customer::whereBetween('created_at', [$startDate, $endDate])->count(),
            'active_customers' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->whereNotNull('customer_id')
                ->distinct('customer_id')
                ->count('customer_id'),
            'avg_customer_value' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->whereNotNull('customer_id')
                ->avg('grand_total'),
        ];

        return Inertia::render('Dashboard/Reports/Customers', [
            'topCustomers' => $topCustomers,
            'newCustomers' => $newCustomers,
            'customersByTier' => $customersByTier,
            'summary' => $summary,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Profit Report
     */
    public function profit(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $groupBy = $request->input('group_by', 'day');

        // Profit by period
        $profitByPeriod = $this->getProfitByPeriod($startDate, $endDate, $groupBy);

        // Profit by product
        $profitByProduct = TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->where('transactions.payment_status', 'paid')
            ->whereNotNull('transaction_details.product_id')
            ->select(
                'products.title',
                DB::raw('SUM((transaction_details.price - products.buy_price) * transaction_details.qty) as total_profit'),
                DB::raw('SUM(transaction_details.qty) as total_qty'),
                DB::raw('AVG((transaction_details.price - products.buy_price) / NULLIF(transaction_details.price, 0) * 100) as avg_margin')
            )
            ->groupBy('products.id', 'products.title')
            ->orderByDesc('total_profit')
            ->limit(20)
            ->get();

        // Profit by category
        $profitByCategory = TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('transactions.payment_status', 'paid')
            ->whereNotNull('transaction_details.product_id')
            ->select(
                'categories.name as category',
                DB::raw('SUM((transaction_details.price - products.buy_price) * transaction_details.qty) as total_profit'),
                DB::raw('AVG((transaction_details.price - products.buy_price) / NULLIF(transaction_details.price, 0) * 100) as avg_margin')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_profit')
            ->get();

        // Summary
        $totalProfit = TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->where('transactions.payment_status', 'paid')
            ->whereNotNull('transaction_details.product_id')
            ->sum(DB::raw('(transaction_details.price - products.buy_price) * transaction_details.qty'));

        $totalRevenue = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->sum('grand_total');

        $avgMargin = TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->where('transactions.payment_status', 'paid')
            ->whereNotNull('transaction_details.product_id')
            ->avg(DB::raw('(transaction_details.price - products.buy_price) / NULLIF(transaction_details.price, 0) * 100'));

        $summary = [
            'total_profit' => $totalProfit ?? 0,
            'total_revenue' => $totalRevenue ?? 0,
            'avg_profit_margin' => $avgMargin ?? 0,
            'total_cost' => ($totalRevenue ?? 0) - ($totalProfit ?? 0),
        ];

        return Inertia::render('Dashboard/Reports/ProfitReport', [
            'profitByPeriod' => $profitByPeriod,
            'profitByProduct' => $profitByProduct,
            'profitByCategory' => $profitByCategory,
            'summary' => $summary,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'groupBy' => $groupBy,
        ]);
    }

    /**
     * Export report to Excel
     */
    public function exportExcel(Request $request)
    {
        $type = $request->input('type', 'sales');
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $filename = "laporan-{$type}-{$startDate}-{$endDate}.xlsx";

        switch ($type) {
            case 'sales':
                return Excel::download(new SalesReportExport($startDate, $endDate), $filename);
            case 'products':
                return Excel::download(new ProductsReportExport($startDate, $endDate), $filename);
            case 'profit':
                return Excel::download(new ProfitReportExport($startDate, $endDate), $filename);
            default:
                return redirect()->back()->with('error', 'Tipe laporan tidak valid');
        }
    }

    /**
     * Export report to PDF
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'sales'); // sales, products, customers, profit
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $data = [];
        $view = '';

        switch ($type) {
            case 'sales':
                $data = $this->getSalesReportData($startDate, $endDate);
                $view = 'reports.sales';
                break;
            case 'products':
                $data = $this->getProductsReportData($startDate, $endDate);
                $view = 'reports.products';
                break;
            case 'customers':
                $data = $this->getCustomersReportData($startDate, $endDate);
                $view = 'reports.customers';
                break;
            case 'profit':
                $data = $this->getProfitReportData($startDate, $endDate);
                $view = 'reports.profit';
                break;
        }

        $data['start_date'] = $startDate;
        $data['end_date'] = $endDate;
        $data['generated_at'] = now()->format('d M Y H:i:s');

        $pdf = \PDF::loadView($view, $data);

        return $pdf->download("report-{$type}-{$startDate}-to-{$endDate}.pdf");
    }

    /**
     * Helper: Get sales by period
     */
    private function getSalesByPeriod($startDate, $endDate, $groupBy)
    {
        $dateFormat = match($groupBy) {
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        return Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as period"),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(grand_total) as total')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();
    }

    /**
     * Helper: Get profit by period
     */
    private function getProfitByPeriod($startDate, $endDate, $groupBy)
    {
        $dateFormat = match($groupBy) {
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        return TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->where('transactions.payment_status', 'paid')
            ->whereNotNull('transaction_details.product_id')
            ->select(
                DB::raw("DATE_FORMAT(transaction_details.created_at, '{$dateFormat}') as period"),
                DB::raw('SUM((transaction_details.price - products.buy_price) * transaction_details.qty) as total_profit'),
                DB::raw('AVG((transaction_details.price - products.buy_price) / NULLIF(transaction_details.price, 0) * 100) as avg_margin')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();
    }

    /**
     * Helper: Get sales report data for PDF
     */
    private function getSalesReportData($startDate, $endDate)
    {
        return [
            'total_sales' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->sum('grand_total'),
            'total_transactions' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->count(),
            'transactions' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->with(['customer', 'cashier'])
                ->orderByDesc('created_at')
                ->get(),
        ];
    }

    /**
     * Helper: Get products report data for PDF
     */
    private function getProductsReportData($startDate, $endDate)
    {
        return [
            'best_selling' => TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
                ->join('products', 'transaction_details.product_id', '=', 'products.id')
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->where('transactions.payment_status', 'paid')
                ->whereNotNull('transaction_details.product_id')
                ->select(
                    'products.title',
                    'products.barcode',
                    DB::raw('SUM(transaction_details.qty) as total_qty'),
                    DB::raw('SUM(transaction_details.price * transaction_details.qty) as total_sales')
                )
                ->groupBy('products.id', 'products.title', 'products.barcode')
                ->orderByDesc('total_qty')
                ->limit(20)
                ->get(),
        ];
    }

    /**
     * Helper: Get customers report data for PDF
     */
    private function getCustomersReportData($startDate, $endDate)
    {
        return [
            'top_customers' => Transaction::whereBetween('transactions.created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->whereNotNull('customer_id')
                ->join('customers', 'transactions.customer_id', '=', 'customers.id')
                ->select(
                    'customers.name',
                    'customers.phone',
                    DB::raw('COUNT(*) as transaction_count'),
                    DB::raw('SUM(grand_total) as total_spent')
                )
                ->groupBy('customers.id', 'customers.name', 'customers.phone')
                ->orderByDesc('total_spent')
                ->limit(20)
                ->get(),
        ];
    }

    /**
     * Helper: Get profit report data for PDF
     */
    private function getProfitReportData($startDate, $endDate)
    {
        $totalProfit = TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->where('transactions.payment_status', 'paid')
            ->whereNotNull('transaction_details.product_id')
            ->sum(DB::raw('(transaction_details.price - products.buy_price) * transaction_details.qty'));

        return [
            'total_profit' => $totalProfit ?? 0,
            'total_revenue' => Transaction::whereBetween('created_at', [$startDate, $endDate])
                ->where('payment_status', 'paid')
                ->sum('grand_total'),
            'profit_by_product' => TransactionDetail::whereBetween('transaction_details.created_at', [$startDate, $endDate])
                ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
                ->join('products', 'transaction_details.product_id', '=', 'products.id')
                ->where('transactions.payment_status', 'paid')
                ->whereNotNull('transaction_details.product_id')
                ->select(
                    'products.title',
                    DB::raw('SUM((transaction_details.price - products.buy_price) * transaction_details.qty) as total_profit'),
                    DB::raw('AVG((transaction_details.price - products.buy_price) / NULLIF(transaction_details.price, 0) * 100) as avg_margin')
                )
                ->groupBy('products.id', 'products.title')
                ->orderByDesc('total_profit')
                ->limit(20)
                ->get(),
        ];
    }
}
