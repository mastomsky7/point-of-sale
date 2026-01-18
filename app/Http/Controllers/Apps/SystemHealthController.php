<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Services\Cache\CacheService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemHealthController extends Controller
{
    /**
     * H5: Display system health dashboard
     */
    public function index()
    {
        return Inertia::render('Dashboard/Settings/SystemHealth', [
            'health' => $this->getSystemHealth(),
            'performance' => $this->getPerformanceMetrics(),
            'storage' => $this->getStorageMetrics(),
            'database' => $this->getDatabaseMetrics(),
            'queue' => $this->getQueueMetrics(),
        ]);
    }

    /**
     * H5: Get overall system health status
     */
    protected function getSystemHealth(): array
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
            'queue' => $this->checkQueue(),
        ];

        $allHealthy = collect($checks)->every(fn($check) => $check['status'] === 'healthy');

        return [
            'status' => $allHealthy ? 'healthy' : 'degraded',
            'checks' => $checks,
            'last_checked' => now()->toIso8601String(),
        ];
    }

    /**
     * H5: Check database connectivity
     */
    protected function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            $responseTime = $this->measureDatabaseResponseTime();

            return [
                'status' => 'healthy',
                'message' => 'Database connection successful',
                'response_time_ms' => $responseTime,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage(),
                'response_time_ms' => null,
            ];
        }
    }

    /**
     * H5: Measure database response time
     */
    protected function measureDatabaseResponseTime(): float
    {
        $start = microtime(true);
        DB::select('SELECT 1');
        $end = microtime(true);

        return round(($end - $start) * 1000, 2);
    }

    /**
     * H5: Check cache system
     */
    protected function checkCache(): array
    {
        try {
            $key = 'health_check_' . time();
            Cache::put($key, 'test', 10);
            $value = Cache::get($key);
            Cache::forget($key);

            if ($value === 'test') {
                return [
                    'status' => 'healthy',
                    'message' => 'Cache is working',
                    'driver' => config('cache.default'),
                ];
            }

            return [
                'status' => 'degraded',
                'message' => 'Cache write/read mismatch',
                'driver' => config('cache.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Cache error: ' . $e->getMessage(),
                'driver' => config('cache.default'),
            ];
        }
    }

    /**
     * H5: Check storage system
     */
    protected function checkStorage(): array
    {
        try {
            $diskSpace = disk_free_space(storage_path());
            $totalSpace = disk_total_space(storage_path());
            $usedPercent = round((($totalSpace - $diskSpace) / $totalSpace) * 100, 2);

            $status = $usedPercent < 90 ? 'healthy' : ($usedPercent < 95 ? 'degraded' : 'unhealthy');

            return [
                'status' => $status,
                'message' => "Storage {$usedPercent}% used",
                'used_percent' => $usedPercent,
                'free_gb' => round($diskSpace / (1024 ** 3), 2),
                'total_gb' => round($totalSpace / (1024 ** 3), 2),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Storage check failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * H5: Check queue system
     */
    protected function checkQueue(): array
    {
        try {
            $driver = config('queue.default');
            $connection = config("queue.connections.{$driver}");

            return [
                'status' => 'healthy',
                'message' => 'Queue system available',
                'driver' => $driver,
                'connection' => $connection['driver'] ?? 'sync',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Queue check failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * H5: Get performance metrics
     */
    protected function getPerformanceMetrics(): array
    {
        return [
            'memory_usage' => $this->getMemoryUsage(),
            'cpu_load' => $this->getCpuLoad(),
            'app_version' => config('app.version', '1.0.0'),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
        ];
    }

    /**
     * H5: Get memory usage
     */
    protected function getMemoryUsage(): array
    {
        $usage = memory_get_usage(true);
        $peak = memory_get_peak_usage(true);
        $limit = $this->getMemoryLimit();

        return [
            'current_mb' => round($usage / (1024 ** 2), 2),
            'peak_mb' => round($peak / (1024 ** 2), 2),
            'limit_mb' => $limit,
            'usage_percent' => $limit > 0 ? round(($usage / ($limit * 1024 ** 2)) * 100, 2) : 0,
        ];
    }

    /**
     * H5: Get PHP memory limit in MB
     */
    protected function getMemoryLimit(): int
    {
        $limit = ini_get('memory_limit');

        if ($limit == -1) {
            return -1;
        }

        $unit = strtolower(substr($limit, -1));
        $value = (int) substr($limit, 0, -1);

        return match ($unit) {
            'g' => $value * 1024,
            'm' => $value,
            'k' => (int) ($value / 1024),
            default => (int) ($value / (1024 ** 2)),
        };
    }

    /**
     * H5: Get CPU load average (Unix only)
     */
    protected function getCpuLoad(): ?array
    {
        if (function_exists('sys_getloadavg')) {
            $load = sys_getloadavg();
            return [
                '1min' => round($load[0], 2),
                '5min' => round($load[1], 2),
                '15min' => round($load[2], 2),
            ];
        }

        return null;
    }

    /**
     * H5: Get storage metrics
     */
    protected function getStorageMetrics(): array
    {
        return [
            'uploads' => $this->getDirectorySize(storage_path('app/public')),
            'logs' => $this->getDirectorySize(storage_path('logs')),
            'cache' => $this->getDirectorySize(storage_path('framework/cache')),
            'sessions' => $this->getDirectorySize(storage_path('framework/sessions')),
        ];
    }

    /**
     * H5: Get directory size
     */
    protected function getDirectorySize(string $path): array
    {
        try {
            if (!file_exists($path)) {
                return ['size_mb' => 0, 'file_count' => 0];
            }

            $size = 0;
            $count = 0;

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path, \RecursiveDirectoryIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $size += $file->getSize();
                    $count++;
                }
            }

            return [
                'size_mb' => round($size / (1024 ** 2), 2),
                'file_count' => $count,
            ];
        } catch (\Exception $e) {
            return ['size_mb' => 0, 'file_count' => 0];
        }
    }

    /**
     * H5: Get database metrics
     */
    protected function getDatabaseMetrics(): array
    {
        try {
            $tableStats = DB::select("
                SELECT
                    table_name,
                    table_rows,
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
                FROM information_schema.TABLES
                WHERE table_schema = DATABASE()
                ORDER BY (data_length + index_length) DESC
                LIMIT 10
            ");

            $totalSize = DB::selectOne("
                SELECT
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS total_size_mb
                FROM information_schema.TABLES
                WHERE table_schema = DATABASE()
            ");

            return [
                'total_size_mb' => $totalSize->total_size_mb ?? 0,
                'top_tables' => collect($tableStats)->map(function ($table) {
                    return [
                        'name' => $table->table_name,
                        'rows' => (int) $table->table_rows,
                        'size_mb' => (float) $table->size_mb,
                    ];
                })->toArray(),
            ];
        } catch (\Exception $e) {
            return [
                'total_size_mb' => 0,
                'top_tables' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * H5: Get queue metrics
     */
    protected function getQueueMetrics(): array
    {
        try {
            $failedJobs = DB::table('failed_jobs')->count();

            return [
                'failed_jobs' => $failedJobs,
                'driver' => config('queue.default'),
            ];
        } catch (\Exception $e) {
            return [
                'failed_jobs' => 0,
                'driver' => config('queue.default'),
                'error' => 'Failed jobs table not available',
            ];
        }
    }

    /**
     * H5: Clear cache endpoint
     */
    public function clearCache(CacheService $cacheService)
    {
        try {
            $cacheService->clearAllCaches();

            return redirect()->back()->with('success', 'All caches cleared successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to clear caches: ' . $e->getMessage());
        }
    }

    /**
     * H5: Optimize database endpoint
     */
    public function optimizeDatabase()
    {
        try {
            $tables = DB::select('SHOW TABLES');
            $database = config('database.connections.mysql.database');

            foreach ($tables as $table) {
                $tableName = $table->{"Tables_in_{$database}"};
                DB::statement("OPTIMIZE TABLE {$tableName}");
            }

            return redirect()->back()->with('success', 'Database optimized successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to optimize database: ' . $e->getMessage());
        }
    }
}
