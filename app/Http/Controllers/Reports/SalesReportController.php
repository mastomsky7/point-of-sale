<?php

namespace App\Http\Controllers\Reports;

use App\Models\Customer;
use App\Models\Profit;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesReportController extends BaseReportController
{
    /**
     * Display the sales report.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $filters = [
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'invoice' => $request->input('invoice'),
            'cashier_id' => $request->input('cashier_id'),
            'customer_id' => $request->input('customer_id'),
            'store_id' => $request->input('store_id'), // New: store filter
            'aggregate_mode' => $request->input('aggregate_mode', 'single'), // 'single' or 'all'
        ];

        // Get available stores for filter dropdown
        $availableStores = $this->getAvailableStores();

        $baseListQuery = $this->applyFilters(
            Transaction::query()
                ->with(['cashier:id,name', 'customer:id,name'])
                ->withSum('details as total_items', 'qty')
                ->withSum('profits as total_profit', 'total'),
            $filters
        )->orderByDesc('created_at');

        $transactions = (clone $baseListQuery)
            ->paginate(config('app.pagination.reports', 20))
            ->withQueryString();

        $aggregateQuery = $this->applyFilters(Transaction::query(), $filters);

        $totals = (clone $aggregateQuery)
            ->selectRaw('
                COUNT(*) as orders_count,
                COALESCE(SUM(grand_total), 0) as revenue_total,
                COALESCE(SUM(discount), 0) as discount_total
            ')
            ->first();

        $transactionIds = (clone $aggregateQuery)->pluck('id');

        $itemsSold = $transactionIds->isNotEmpty()
            ? TransactionDetail::whereIn('transaction_id', $transactionIds)->sum('qty')
            : 0;

        $profitTotal = $transactionIds->isNotEmpty()
            ? Profit::whereIn('transaction_id', $transactionIds)->sum('total')
            : 0;

        $summary = [
            'orders_count' => (int) ($totals->orders_count ?? 0),
            'revenue_total' => (int) ($totals->revenue_total ?? 0),
            'discount_total' => (int) ($totals->discount_total ?? 0),
            'items_sold' => (int) $itemsSold,
            'profit_total' => (int) $profitTotal,
            'average_order' => ($totals->orders_count ?? 0) > 0
                ? (int) round($totals->revenue_total / $totals->orders_count)
                : 0,
        ];

        // Get store-specific breakdown if client owner viewing all stores
        $storeBreakdown = null;
        if ($filters['aggregate_mode'] === 'all' && $user->hasRole('client-owner')) {
            $storeBreakdown = $this->getStoreBreakdown($filters, $availableStores);
        }

        return Inertia::render('Dashboard/Reports/Sales', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $filters,
            'cashiers' => User::select('id', 'name')->orderBy('name')->get(),
            'customers' => Customer::select('id', 'name')->orderBy('name')->get(),
            'availableStores' => $availableStores,
            'storeBreakdown' => $storeBreakdown,
        ]);
    }

    /**
     * Apply table filters (extends parent with additional filters).
     */
    protected function applyFilters(\Illuminate\Database\Eloquent\Builder $query, array $filters): \Illuminate\Database\Eloquent\Builder
    {
        // Call parent filters first
        $query = parent::applyFilters($query, $filters);

        // Additional filters specific to sales report
        $query = $query
            ->when($filters['cashier_id'] ?? null, fn ($q, $cashier) => $q->where('cashier_id', $cashier))
            ->when($filters['customer_id'] ?? null, fn ($q, $customer) => $q->where('customer_id', $customer));

        // Store filtering with aggregate mode
        if (isset($filters['aggregate_mode']) && $filters['aggregate_mode'] === 'all') {
            $query = $query->withoutStoreScope();
            if ($filters['store_id'] ?? null) {
                $query = $query->where('store_id', $filters['store_id']);
            }
        } elseif ($filters['store_id'] ?? null) {
            $query = $query->withoutStoreScope()->where('store_id', $filters['store_id']);
        }

        return $query;
    }

    /**
     * Get breakdown by store for client owners
     */
    protected function getStoreBreakdown($filters, $availableStores)
    {
        $breakdown = [];

        foreach ($availableStores as $store) {
            $storeFilters = array_merge($filters, ['store_id' => $store->id]);
            $query = $this->applyFilters(Transaction::query()->withoutStoreScope(), $storeFilters);

            $totals = $query->selectRaw('
                COUNT(*) as orders_count,
                COALESCE(SUM(grand_total), 0) as revenue_total
            ')->first();

            $breakdown[] = [
                'store_id' => $store->id,
                'store_name' => $store->name,
                'store_code' => $store->code,
                'orders_count' => (int) ($totals->orders_count ?? 0),
                'revenue_total' => (int) ($totals->revenue_total ?? 0),
            ];
        }

        return $breakdown;
    }
}
