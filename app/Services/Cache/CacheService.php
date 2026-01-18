<?php

namespace App\Services\Cache;

use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class CacheService
{
    // H2: Cache key prefixes
    const PREFIX_ANALYTICS = 'analytics:';
    const PREFIX_DASHBOARD = 'dashboard:';
    const PREFIX_PRODUCT = 'product:';
    const PREFIX_SERVICE = 'service:';
    const PREFIX_CUSTOMER = 'customer:';
    const PREFIX_APPOINTMENT = 'appointment:';

    // Cache durations (in seconds)
    const TTL_SHORT = 300;      // 5 minutes
    const TTL_MEDIUM = 1800;    // 30 minutes
    const TTL_LONG = 3600;      // 1 hour
    const TTL_DAILY = 86400;    // 24 hours

    /**
     * H2: Get or cache analytics data
     */
    public function getAnalytics(string $key, \Closure $callback, int $ttl = self::TTL_MEDIUM): mixed
    {
        $cacheKey = self::PREFIX_ANALYTICS . $key;

        return Cache::remember($cacheKey, $ttl, $callback);
    }

    /**
     * H2: Get or cache dashboard metrics
     */
    public function getDashboardMetrics(string $key, \Closure $callback, int $ttl = self::TTL_SHORT): mixed
    {
        $cacheKey = self::PREFIX_DASHBOARD . $key;

        return Cache::remember($cacheKey, $ttl, $callback);
    }

    /**
     * H2: Get or cache product data
     */
    public function getProduct(int $productId, \Closure $callback, int $ttl = self::TTL_LONG): mixed
    {
        $cacheKey = self::PREFIX_PRODUCT . $productId;

        return Cache::remember($cacheKey, $ttl, $callback);
    }

    /**
     * H2: Get or cache service data
     */
    public function getService(int $serviceId, \Closure $callback, int $ttl = self::TTL_LONG): mixed
    {
        $cacheKey = self::PREFIX_SERVICE . $serviceId;

        return Cache::remember($cacheKey, $ttl, $callback);
    }

    /**
     * H2: Get or cache customer data
     */
    public function getCustomer(int $customerId, \Closure $callback, int $ttl = self::TTL_MEDIUM): mixed
    {
        $cacheKey = self::PREFIX_CUSTOMER . $customerId;

        return Cache::remember($cacheKey, $ttl, $callback);
    }

    /**
     * H2: Invalidate product cache
     */
    public function invalidateProduct(int $productId): void
    {
        Cache::forget(self::PREFIX_PRODUCT . $productId);
        $this->invalidateTaggedCache('products');
    }

    /**
     * H2: Invalidate service cache
     */
    public function invalidateService(int $serviceId): void
    {
        Cache::forget(self::PREFIX_SERVICE . $serviceId);
        $this->invalidateTaggedCache('services');
    }

    /**
     * H2: Invalidate customer cache
     */
    public function invalidateCustomer(int $customerId): void
    {
        Cache::forget(self::PREFIX_CUSTOMER . $customerId);
        $this->invalidateTaggedCache('customers');
    }

    /**
     * H2: Invalidate analytics cache
     */
    public function invalidateAnalytics(string $key = null): void
    {
        if ($key) {
            Cache::forget(self::PREFIX_ANALYTICS . $key);
        } else {
            $this->invalidateTaggedCache('analytics');
        }
    }

    /**
     * H2: Invalidate dashboard cache
     */
    public function invalidateDashboard(): void
    {
        $this->invalidateTaggedCache('dashboard');
    }

    /**
     * H2: Invalidate tagged cache (for Redis/Memcached)
     */
    protected function invalidateTaggedCache(string $tag): void
    {
        try {
            Cache::tags([$tag])->flush();
        } catch (\Exception $e) {
            // Fallback for file cache driver (doesn't support tags)
            // Log the error but don't throw
            \Log::debug("Cache tag flush failed for {$tag}: " . $e->getMessage());
        }
    }

    /**
     * H2: Cache top products
     */
    public function getTopProducts(int $limit = 10, int $ttl = self::TTL_MEDIUM): mixed
    {
        return $this->getAnalytics('top_products_' . $limit, function () use ($limit) {
            return \DB::table('transaction_details')
                ->join('products', 'transaction_details.product_id', '=', 'products.id')
                ->whereNotNull('transaction_details.product_id')
                ->select(
                    'products.id',
                    'products.name',
                    \DB::raw('SUM(transaction_details.quantity) as total_sold'),
                    \DB::raw('SUM(transaction_details.subtotal) as total_revenue')
                )
                ->groupBy('products.id', 'products.name')
                ->orderByDesc('total_revenue')
                ->limit($limit)
                ->get();
        }, $ttl);
    }

    /**
     * H2: Cache top services
     */
    public function getTopServices(int $limit = 10, int $ttl = self::TTL_MEDIUM): mixed
    {
        return $this->getAnalytics('top_services_' . $limit, function () use ($limit) {
            return \DB::table('appointment_services')
                ->join('services', 'appointment_services.service_id', '=', 'services.id')
                ->select(
                    'services.id',
                    'services.name',
                    \DB::raw('COUNT(*) as booking_count'),
                    \DB::raw('SUM(appointment_services.price) as total_revenue')
                )
                ->groupBy('services.id', 'services.name')
                ->orderByDesc('booking_count')
                ->limit($limit)
                ->get();
        }, $ttl);
    }

    /**
     * H2: Cache low stock products
     */
    public function getLowStockProducts(int $ttl = self::TTL_SHORT): mixed
    {
        return $this->getDashboardMetrics('low_stock_products', function () {
            return \App\Models\Product::where('stock', '<=', \DB::raw('stock_minimum'))
                ->where('stock', '>', 0)
                ->select('id', 'name', 'stock', 'stock_minimum', 'price')
                ->orderBy('stock')
                ->limit(20)
                ->get();
        }, $ttl);
    }

    /**
     * H2: Cache revenue statistics
     */
    public function getRevenueStats(string $period, int $ttl = self::TTL_MEDIUM): mixed
    {
        return $this->getAnalytics('revenue_stats_' . $period, function () use ($period) {
            $startDate = $this->getPeriodStartDate($period);
            $endDate = now();

            return [
                'total_revenue' => \App\Models\Transaction::whereBetween('created_at', [$startDate, $endDate])
                    ->sum('grand_total'),
                'transaction_count' => \App\Models\Transaction::whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'avg_transaction_value' => \App\Models\Transaction::whereBetween('created_at', [$startDate, $endDate])
                    ->avg('grand_total'),
            ];
        }, $ttl);
    }

    /**
     * H2: Helper to get period start date
     */
    protected function getPeriodStartDate(string $period): Carbon
    {
        return match ($period) {
            'today' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };
    }

    /**
     * H2: Warm up cache (can be called on deployment or schedule)
     */
    public function warmUpCache(): void
    {
        // Warm up commonly accessed data
        $this->getTopProducts();
        $this->getTopServices();
        $this->getLowStockProducts();
        $this->getRevenueStats('today');
        $this->getRevenueStats('week');
        $this->getRevenueStats('month');
    }

    /**
     * H2: Clear all application caches
     */
    public function clearAllCaches(): void
    {
        Cache::flush();
    }

    /**
     * H2: Get cache statistics
     */
    public function getCacheStats(): array
    {
        try {
            if (Cache::getStore() instanceof \Illuminate\Cache\RedisStore) {
                $redis = Cache::getStore()->connection();
                return [
                    'driver' => 'redis',
                    'info' => $redis->info(),
                ];
            }
        } catch (\Exception $e) {
            // Fallback
        }

        return [
            'driver' => config('cache.default'),
            'info' => 'Statistics not available for this driver',
        ];
    }
}
