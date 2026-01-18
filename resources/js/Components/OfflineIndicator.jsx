import { useState, useEffect } from 'react';
import syncManager from '@/Utils/SyncManager';

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState({ total: 0 });
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Initialize sync manager
        syncManager.init();

        // Handle online/offline events
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Subscribe to sync events
        const unsubscribe = syncManager.subscribe((event, data) => {
            if (event === 'sync-start') {
                setIsSyncing(true);
            } else if (event === 'sync-complete' || event === 'sync-error') {
                setIsSyncing(false);
                updatePendingCount();
            }
        });

        // Update pending count periodically
        updatePendingCount();
        const interval = setInterval(updatePendingCount, 10000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const updatePendingCount = async () => {
        const count = await syncManager.getPendingCount();
        setPendingCount(count);
    };

    const handleSync = async () => {
        if (!isOnline || isSyncing) return;
        await syncManager.forceSync();
    };

    // Don't show if online and no pending items
    if (isOnline && pendingCount.total === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`rounded-lg shadow-lg border ${
                isOnline
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800'
            }`}>
                <div className="p-4">
                    <div className="flex items-center space-x-3">
                        {/* Status Icon */}
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                            isOnline
                                ? 'bg-green-500 animate-pulse'
                                : 'bg-yellow-500 animate-pulse'
                        }`} />

                        {/* Status Text */}
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${
                                isOnline
                                    ? 'text-gray-900 dark:text-gray-100'
                                    : 'text-yellow-900 dark:text-yellow-100'
                            }`}>
                                {isOnline ? (
                                    isSyncing ? 'Syncing...' : 'Online'
                                ) : (
                                    'Offline Mode'
                                )}
                            </p>

                            {pendingCount.total > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {pendingCount.total} pending {pendingCount.total === 1 ? 'item' : 'items'}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                            {pendingCount.total > 0 && (
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                >
                                    {showDetails ? 'Hide' : 'Details'}
                                </button>
                            )}

                            {isOnline && pendingCount.total > 0 && (
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Details Panel */}
                    {showDetails && pendingCount.total > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="space-y-1">
                                {pendingCount.transactions > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600 dark:text-gray-400">Transactions:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {pendingCount.transactions}
                                        </span>
                                    </div>
                                )}
                                {pendingCount.appointments > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600 dark:text-gray-400">Appointments:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {pendingCount.appointments}
                                        </span>
                                    </div>
                                )}
                                {pendingCount.queue > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600 dark:text-gray-400">Other:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {pendingCount.queue}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {!isOnline && (
                                <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                                    Items will auto-sync when you're back online
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
