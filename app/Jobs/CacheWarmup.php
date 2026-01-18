<?php

namespace App\Jobs;

use App\Services\Cache\CacheService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CacheWarmup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * H4: Execute the job to warm up application caches
     */
    public function handle(CacheService $cacheService): void
    {
        Log::info('CacheWarmup: Starting cache warmup');

        try {
            $cacheService->warmUpCache();
            Log::info('CacheWarmup: Cache warmup completed successfully');
        } catch (\Exception $e) {
            Log::error('CacheWarmup: Error during cache warmup', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
