<?php

namespace App\Http\Controllers\Reports;

use App\Models\Customer;
use App\Models\Profit;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfitReportController extends BaseReportController
{
    public function index(Request $request)
    {
        $user = $request->user();

        $filters = [
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'invoice' => $request->input('invoice'),
            'cashier_id' => $request->input('cashier_id'),
            'customer_id' => $request->input('customer_id'),
            'store_id' => $request->input('store_id'),
            'aggregate_mode' => $request->input('aggregate_mode', 'single'),
        ];

        $availableStores = $this->getAvailableStores();

        $baseQuery = $this->applyFilters(
            Transaction::query()
                ->with(['cashier:id,name', 'customer:id,name'])
                ->withSum('profits as total_profit', 'total')
                ->withSum('details as total_items', 'qty'),
            $filters
        )->orderByDesc('created_at');

        $transactions = (clone $baseQuery)
            ->paginate(config('app.pagination.reports', 20))
            ->withQueryString();

        $transactionIds = (clone $baseQuery)->pluck('id');

        $profitTotal = $transactionIds->isNotEmpty()
            ? Profit::whereIn('transaction_id', $transactionIds)->sum('total')
            : 0;

        $revenueTotal = (clone $baseQuery)->sum('grand_total');

        $ordersCount = (clone $baseQuery)->count();

        $itemsSold = $transactionIds->isNotEmpty()
            ? TransactionDetail::whereIn('transaction_id', $transactionIds)->sum('qty')
            : 0;

        $bestTransaction = (clone $baseQuery)->get()->sortByDesc('total_profit')->first();

        $summary = [
            'profit_total' => (int) $profitTotal,
            'revenue_total' => (int) $revenueTotal,
            'orders_count' => (int) $ordersCount,
            'items_sold' => (int) $itemsSold,
            'average_profit' => $ordersCount > 0 ? (int) round($profitTotal / $ordersCount) : 0,
            'margin' => $revenueTotal > 0 ? round(($profitTotal / $revenueTotal) * 100, 2) : 0,
            'best_invoice' => $bestTransaction?->invoice,
            'best_profit' => (int) ($bestTransaction?->total_profit ?? 0),
        ];

        return Inertia::render('Dashboard/Reports/Profit', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $filters,
            'cashiers' => User::select('id', 'name')->orderBy('name')->get(),
            'customers' => Customer::select('id', 'name')->orderBy('name')->get(),
            'availableStores' => $availableStores,
        ]);
    }

    /**
     * Apply table filters (extends parent with additional filters).
     */
    protected function applyFilters(\Illuminate\Database\Eloquent\Builder $query, array $filters): \Illuminate\Database\Eloquent\Builder
    {
        // Call parent filters first
        $query = parent::applyFilters($query, $filters);

        // Additional filters specific to profit report
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
}
