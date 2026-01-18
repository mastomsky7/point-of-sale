<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Store;
use App\Models\Transaction;
use App\Models\StoreLicense;
use Carbon\Carbon;

class DashboardWidgetController extends Controller
{
    /**
     * Get multi-store performance comparison
     */
    public function storeComparison(Request $request)
    {
        $user = $request->user();
        $period = $request->input('period', 'today'); // today, week, month

        // Get available stores
        $stores = $this->getAvailableStores($user);

        if ($stores->count() <= 1) {
            return response()->json([
                'data' => [],
                'message' => 'Multi-store comparison requires multiple stores'
            ]);
        }

        $comparison = [];

        foreach ($stores as $store) {
            $stats = $this->getStoreStats($store->id, $period);

            $comparison[] = [
                'store_id' => $store->id,
                'store_name' => $store->name,
                'store_code' => $store->code,
                'stats' => $stats,
            ];
        }

        return response()->json(['data' => $comparison]);
    }

    /**
     * Get license status for all stores
     */
    public function licenseStatus(Request $request)
    {
        $user = $request->user();
        $stores = $this->getAvailableStores($user);

        $licenses = [];

        foreach ($stores as $store) {
            $license = $store->license;

            if ($license) {
                $licenses[] = [
                    'store_id' => $store->id,
                    'store_name' => $store->name,
                    'license_key' => $license->license_key,
                    'status' => $license->status,
                    'expires_at' => $license->expires_at?->format('Y-m-d'),
                    'days_until_expiry' => $license->daysUntilExpiry(),
                    'is_in_grace_period' => $license->isInGracePeriod(),
                    'is_expired' => $license->isExpired(),
                    'plan_name' => $license->plan?->name,
                ];
            } else {
                $licenses[] = [
                    'store_id' => $store->id,
                    'store_name' => $store->name,
                    'license_key' => null,
                    'status' => 'no_license',
                    'message' => 'No license assigned',
                ];
            }
        }

        return response()->json(['data' => $licenses]);
    }

    /**
     * Get available stores for user
     */
    protected function getAvailableStores($user)
    {
        if ($user->isSuperAdmin()) {
            return Store::with(['client', 'license.plan'])->get();
        }

        if ($user->client_id) {
            return Store::where('client_id', $user->client_id)
                ->with(['client', 'license.plan'])
                ->get();
        }

        if ($user->default_store_id) {
            return Store::where('id', $user->default_store_id)
                ->with(['client', 'license.plan'])
                ->get();
        }

        return collect();
    }

    /**
     * Get statistics for a specific store
     */
    protected function getStoreStats($storeId, $period)
    {
        $query = Transaction::withoutStoreScope()
            ->where('store_id', $storeId);

        // Apply period filter
        switch ($period) {
            case 'today':
                $query->whereDate('created_at', Carbon::today());
                break;
            case 'week':
                $query->whereBetween('created_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
                break;
            case 'month':
                $query->whereMonth('created_at', Carbon::now()->month)
                      ->whereYear('created_at', Carbon::now()->year);
                break;
        }

        $stats = $query->selectRaw('
            COUNT(*) as orders_count,
            COALESCE(SUM(grand_total), 0) as revenue_total,
            COALESCE(AVG(grand_total), 0) as average_order
        ')->first();

        return [
            'orders_count' => (int) ($stats->orders_count ?? 0),
            'revenue_total' => (int) ($stats->revenue_total ?? 0),
            'average_order' => (int) ($stats->average_order ?? 0),
            'period' => $period,
        ];
    }
}
