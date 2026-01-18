<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Transaction;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Staff;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class BusinessIntelligenceController extends Controller
{
    /**
     * G5: Display comprehensive business intelligence dashboard
     */
    public function index(Request $request)
    {
        // Date range defaults
        $period = $request->input('period', 'month');
        $customStart = $request->input('start_date');
        $customEnd = $request->input('end_date');

        [$startDate, $endDate] = $this->getDateRange($period, $customStart, $customEnd);

        // Collect all analytics
        $overview = $this->getOverviewMetrics($startDate, $endDate);
        $salesTrends = $this->getSalesTrends($startDate, $endDate, $period);
        $topPerformers = $this->getTopPerformers($startDate, $endDate);
        $customerSegmentation = $this->getCustomerSegmentation();
        $growthMetrics = $this->getGrowthMetrics($startDate, $endDate);
        $inventoryInsights = $this->getInventoryInsights();

        return Inertia::render('Dashboard/BusinessIntelligence', [
            'overview' => $overview,
            'salesTrends' => $salesTrends,
            'topPerformers' => $topPerformers,
            'customerSegmentation' => $customerSegmentation,
            'growthMetrics' => $growthMetrics,
            'inventoryInsights' => $inventoryInsights,
            'period' => $period,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * G5-1: Get overview metrics
     */
    private function getOverviewMetrics($startDate, $endDate)
    {
        // Revenue metrics
        $totalRevenue = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->sum('grand_total');

        $transactionCount = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $avgTransactionValue = $transactionCount > 0 ? $totalRevenue / $transactionCount : 0;

        // Customer metrics
        $totalCustomers = Customer::count();
        $newCustomers = Customer::whereBetween('created_at', [$startDate, $endDate])->count();
        $activeCustomers = Customer::whereHas('transactions', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        })->count();

        // Appointment metrics
        $totalAppointments = Appointment::whereBetween('appointment_date', [$startDate, $endDate])->count();
        $completedAppointments = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        // Calculate fulfillment rate
        $fulfillmentRate = $totalAppointments > 0
            ? round(($completedAppointments / $totalAppointments) * 100, 2)
            : 0;

        return [
            'total_revenue' => $totalRevenue,
            'transaction_count' => $transactionCount,
            'avg_transaction_value' => round($avgTransactionValue, 2),
            'total_customers' => $totalCustomers,
            'new_customers' => $newCustomers,
            'active_customers' => $activeCustomers,
            'total_appointments' => $totalAppointments,
            'completed_appointments' => $completedAppointments,
            'fulfillment_rate' => $fulfillmentRate,
        ];
    }

    /**
     * G5-2: Get sales trends over time
     */
    private function getSalesTrends($startDate, $endDate, $period)
    {
        $groupBy = match ($period) {
            'week' => 'DATE(created_at)',
            'month' => 'DATE(created_at)',
            'quarter' => 'WEEK(created_at, 1)',
            'year' => 'MONTH(created_at)',
            default => 'DATE(created_at)',
        };

        $trends = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw("{$groupBy} as period"),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(grand_total) as revenue'),
                DB::raw('AVG(grand_total) as avg_value')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period,
                    'transaction_count' => $item->transaction_count,
                    'revenue' => $item->revenue,
                    'avg_value' => round($item->avg_value, 2),
                ];
            });

        return $trends;
    }

    /**
     * G5-3: Get top performers (products, services, staff)
     */
    private function getTopPerformers($startDate, $endDate)
    {
        // Top products by revenue
        $topProducts = DB::table('transaction_details')
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->whereBetween('transactions.created_at', [$startDate, $endDate])
            ->whereNotNull('transaction_details.product_id')
            ->select(
                'products.id',
                'products.title as name',
                DB::raw('SUM(transaction_details.qty) as total_quantity'),
                DB::raw('SUM(transaction_details.price * transaction_details.qty) as total_revenue')
            )
            ->groupBy('products.id', 'products.title')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // Top services by bookings
        $topServices = DB::table('appointment_services')
            ->join('appointments', 'appointment_services.appointment_id', '=', 'appointments.id')
            ->join('services', 'appointment_services.service_id', '=', 'services.id')
            ->whereBetween('appointments.appointment_date', [$startDate, $endDate])
            ->select(
                'services.id',
                'services.name',
                DB::raw('COUNT(*) as booking_count'),
                DB::raw('SUM(appointment_services.price) as total_revenue')
            )
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('booking_count')
            ->limit(10)
            ->get();

        // Top staff by performance
        $topStaff = Staff::where('is_active', true)
            ->select('id', 'name')
            ->get()
            ->map(function ($staff) use ($startDate, $endDate) {
                $appointmentsCount = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
                    ->where('staff_id', $staff->id)
                    ->count();

                $revenue = Transaction::whereBetween('created_at', [$startDate, $endDate])
                    ->whereHas('appointment', function ($query) use ($staff) {
                        $query->where('staff_id', $staff->id);
                    })
                    ->sum('grand_total');

                return [
                    'id' => $staff->id,
                    'name' => $staff->name,
                    'appointments_count' => $appointmentsCount,
                    'revenue' => $revenue,
                ];
            })
            ->sortByDesc('revenue')
            ->take(10)
            ->values();

        return [
            'products' => $topProducts,
            'services' => $topServices,
            'staff' => $topStaff,
        ];
    }

    /**
     * G5-4: Get customer segmentation
     */
    private function getCustomerSegmentation()
    {
        // Loyalty tier distribution
        $tierDistribution = Customer::select('loyalty_tier', DB::raw('COUNT(*) as count'))
            ->groupBy('loyalty_tier')
            ->get()
            ->map(function ($item) {
                return [
                    'tier' => $item->loyalty_tier ?: 'bronze',
                    'count' => $item->count,
                ];
            });

        // Customer value segments
        $customersByValue = Customer::select(
            DB::raw('CASE
                WHEN total_spend >= 10000000 THEN "High Value"
                WHEN total_spend >= 2000000 THEN "Medium Value"
                WHEN total_spend > 0 THEN "Low Value"
                ELSE "No Spend"
            END as segment'),
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(total_spend) as total_revenue')
        )
            ->groupBy('segment')
            ->get();

        // Customer activity segments
        $customersByActivity = Customer::select(
            DB::raw('CASE
                WHEN visit_count >= 10 THEN "Very Active"
                WHEN visit_count >= 5 THEN "Active"
                WHEN visit_count >= 2 THEN "Moderate"
                WHEN visit_count >= 1 THEN "New"
                ELSE "Inactive"
            END as segment'),
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('segment')
            ->get();

        return [
            'tier_distribution' => $tierDistribution,
            'value_segments' => $customersByValue,
            'activity_segments' => $customersByActivity,
        ];
    }

    /**
     * G5-5: Get growth metrics compared to previous period
     */
    private function getGrowthMetrics($startDate, $endDate)
    {
        $daysDiff = Carbon::parse($endDate)->diffInDays(Carbon::parse($startDate)) + 1;
        $previousStart = Carbon::parse($startDate)->subDays($daysDiff)->toDateString();
        $previousEnd = Carbon::parse($startDate)->subDay()->toDateString();

        // Current period
        $currentRevenue = Transaction::whereBetween('created_at', [$startDate, $endDate])->sum('grand_total');
        $currentTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])->count();
        $currentCustomers = Customer::whereBetween('created_at', [$startDate, $endDate])->count();

        // Previous period
        $previousRevenue = Transaction::whereBetween('created_at', [$previousStart, $previousEnd])->sum('grand_total');
        $previousTransactions = Transaction::whereBetween('created_at', [$previousStart, $previousEnd])->count();
        $previousCustomers = Customer::whereBetween('created_at', [$previousStart, $previousEnd])->count();

        // Calculate growth rates
        $revenueGrowth = $previousRevenue > 0
            ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 2)
            : 0;

        $transactionGrowth = $previousTransactions > 0
            ? round((($currentTransactions - $previousTransactions) / $previousTransactions) * 100, 2)
            : 0;

        $customerGrowth = $previousCustomers > 0
            ? round((($currentCustomers - $previousCustomers) / $previousCustomers) * 100, 2)
            : 0;

        return [
            'revenue_growth' => $revenueGrowth,
            'transaction_growth' => $transactionGrowth,
            'customer_growth' => $customerGrowth,
            'current' => [
                'revenue' => $currentRevenue,
                'transactions' => $currentTransactions,
                'customers' => $currentCustomers,
            ],
            'previous' => [
                'revenue' => $previousRevenue,
                'transactions' => $previousTransactions,
                'customers' => $previousCustomers,
            ],
        ];
    }

    /**
     * G5-6: Get inventory insights
     */
    private function getInventoryInsights()
    {
        // Low stock products (stock <= 10)
        $lowStock = Product::where('stock', '<=', 10)
            ->where('stock', '>', 0)
            ->select('id', 'title as name', 'stock', 'sell_price as price')
            ->orderBy('stock')
            ->limit(10)
            ->get();

        // Out of stock products
        $outOfStock = Product::where('stock', '=', 0)
            ->select('id', 'title as name', 'sell_price as price')
            ->limit(10)
            ->get();

        // Total inventory value
        $inventoryValue = Product::selectRaw('SUM(stock * sell_price) as total_value')
            ->value('total_value') ?? 0;

        $totalProducts = Product::count();
        $lowStockCount = Product::where('stock', '<=', 10)->count();
        $outOfStockCount = Product::where('stock', '=', 0)->count();

        return [
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'inventory_value' => $inventoryValue,
            'total_products' => $totalProducts,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
        ];
    }

    /**
     * Helper: Get date range based on period
     */
    private function getDateRange($period, $customStart = null, $customEnd = null)
    {
        if ($customStart && $customEnd) {
            return [$customStart, $customEnd];
        }

        return match ($period) {
            'today' => [now()->startOfDay()->toDateString(), now()->endOfDay()->toDateString()],
            'week' => [now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString()],
            'month' => [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()],
            'quarter' => [now()->startOfQuarter()->toDateString(), now()->endOfQuarter()->toDateString()],
            'year' => [now()->startOfYear()->toDateString(), now()->endOfYear()->toDateString()],
            default => [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()],
        };
    }
}
