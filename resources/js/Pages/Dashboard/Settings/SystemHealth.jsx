import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    IconServer,
    IconDatabase,
    IconCpu,
    IconDeviceFloppy,
    IconCloudComputing,
    IconCheck,
    IconAlertTriangle,
    IconX,
    IconRefresh,
    IconTrash,
    IconSettings,
} from '@tabler/icons-react';
import { confirmDialog } from '@/Utils/SweetAlertHelper';

export default function SystemHealth({ auth, health, performance, storage, database, queue }) {
    const getStatusColor = (status) => {
        const colors = {
            healthy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            degraded: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            unhealthy: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[status] || colors.degraded;
    };

    const getStatusIcon = (status) => {
        if (status === 'healthy') return <IconCheck className="w-5 h-5" />;
        if (status === 'degraded') return <IconAlertTriangle className="w-5 h-5" />;
        return <IconX className="w-5 h-5" />;
    };

    const handleClearCache = async () => {
        const confirmed = await confirmDialog({
            title: 'Clear Cache?',
            text: 'Semua cache akan dibersihkan',
            confirmButtonText: 'Ya, Clear!',
            cancelButtonText: 'Batal'
        });
        if (confirmed) {
            router.post(route('system-health.clear-cache'));
        }
    };

    const handleOptimizeDatabase = async () => {
        const confirmed = await confirmDialog({
            title: 'Optimize Database?',
            text: 'Database akan dioptimasi',
            confirmButtonText: 'Ya, Optimize!',
            cancelButtonText: 'Batal'
        });
        if (confirmed) {
            router.post(route('system-health.optimize-database'));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="System Health" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                    System Health
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Monitor system performance and health
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleClearCache}
                                    className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors"
                                >
                                    <IconTrash className="w-4 h-4 mr-2" />
                                    Clear Cache
                                </button>
                                <button
                                    onClick={handleOptimizeDatabase}
                                    className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors"
                                >
                                    <IconSettings className="w-4 h-4 mr-2" />
                                    Optimize DB
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Overall Status */}
                    <div className="mb-6">
                        <div className={`p-6 rounded-xl border-2 ${
                            health.status === 'healthy'
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                                : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${
                                        health.status === 'healthy'
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : 'bg-amber-100 dark:bg-amber-900/30'
                                    }`}>
                                        <IconServer className={`w-8 h-8 ${
                                            health.status === 'healthy'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-amber-600 dark:text-amber-400'
                                        }`} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            System {health.status === 'healthy' ? 'Healthy' : 'Degraded'}
                                        </h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Last checked: {new Date(health.last_checked).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Health Checks */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Health Checks
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(health.checks).map(([key, check]) => (
                                <div key={key} className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(check.status)}`}>
                                            {getStatusIcon(check.status)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {check.message}
                                    </p>
                                    {check.response_time_ms && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Response: {check.response_time_ms}ms
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    {performance && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Performance Metrics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Memory Usage
                                        </span>
                                        <IconCpu className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {performance.memory_usage.current_mb} MB
                                    </p>
                                    <div className="mt-2">
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    performance.memory_usage.usage_percent > 80
                                                        ? 'bg-red-600'
                                                        : performance.memory_usage.usage_percent > 60
                                                        ? 'bg-amber-600'
                                                        : 'bg-green-600'
                                                }`}
                                                style={{ width: `${performance.memory_usage.usage_percent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {performance.memory_usage.usage_percent}% of {performance.memory_usage.limit_mb} MB
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            PHP Version
                                        </span>
                                        <IconServer className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {performance.php_version}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Laravel Version
                                        </span>
                                        <IconServer className="w-5 h-5 text-red-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {performance.laravel_version}
                                    </p>
                                </div>

                                {performance.cpu_load && (
                                    <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                CPU Load Average
                                            </span>
                                            <IconCpu className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                1 min: <span className="font-semibold">{performance.cpu_load['1min']}</span>
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                5 min: <span className="font-semibold">{performance.cpu_load['5min']}</span>
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                15 min: <span className="font-semibold">{performance.cpu_load['15min']}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Storage Metrics */}
                    {storage && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Storage Usage
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(storage).map(([key, data]) => (
                                    <div key={key} className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </span>
                                            <IconDeviceFloppy className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {data.size_mb} MB
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {data.file_count} files
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Database Metrics */}
                    {database && database.top_tables && database.top_tables.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Database Tables (Top 10)
                            </h2>
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                    Table Name
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                    Rows
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                    Size (MB)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {database.top_tables.map((table) => (
                                                <tr key={table.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                        {table.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                        {table.rows.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">
                                                        {table.size_mb}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-slate-50 dark:bg-slate-800">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white" colSpan="2">
                                                    Total Database Size
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-primary-600 dark:text-primary-400 text-right">
                                                    {database.total_size_mb} MB
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Queue Status */}
                    {queue && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Queue Status
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Queue Driver
                                        </span>
                                        <IconCloudComputing className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {queue.driver}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Failed Jobs
                                        </span>
                                        <IconAlertTriangle className={`w-5 h-5 ${queue.failed_jobs > 0 ? 'text-red-600' : 'text-green-600'}`} />
                                    </div>
                                    <p className={`text-2xl font-bold ${queue.failed_jobs > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                        {queue.failed_jobs}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
