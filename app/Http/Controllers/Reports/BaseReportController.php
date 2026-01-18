<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

abstract class BaseReportController extends Controller
{
    /**
     * Apply common filters to report queries
     *
     * @param Builder $query
     * @param array $filters
     * @return Builder
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        // Invoice filter
        if (!empty($filters['invoice'])) {
            $query->where('invoice', 'like', '%' . $filters['invoice'] . '%');
        }

        // Date range filter
        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('created_at', [
                $filters['start_date'] . ' 00:00:00',
                $filters['end_date'] . ' 23:59:59'
            ]);
        } elseif (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        } elseif (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        // Store filter
        if (!empty($filters['store_id'])) {
            $query->where('store_id', $filters['store_id']);
        }

        return $query;
    }

    /**
     * Get available stores based on user permissions
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected function getAvailableStores()
    {
        $user = Auth::user();

        if ($user->hasRole('super_admin')) {
            return Store::all();
        }

        if ($user->store_id) {
            return Store::where('id', $user->store_id)->get();
        }

        return collect();
    }

    /**
     * Get default pagination limit
     *
     * @return int
     */
    protected function getPerPage(): int
    {
        return config('app.pagination.reports', 20);
    }
}
