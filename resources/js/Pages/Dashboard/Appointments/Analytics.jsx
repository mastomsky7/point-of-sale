import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    IconTrendingUp,
    IconTrendingDown,
    IconCalendar,
    IconCurrencyDollar,
    IconUsers,
    IconChartBar,
    IconDownload,
    IconArrowLeft,
    IconCheck,
    IconX,
    IconClock,
    IconAlertCircle,
    IconUserCheck,
    IconUserPlus,
    IconAward,
    IconStar,
    IconClockHour4,
} from '@tabler/icons-react';

const formatPrice = (value = 0) =>
    value.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

const formatPercent = (value) => `${value}%`;

export default function Analytics({
    auth,
    conversionStats,
    revenueStats,
    staffPerformance,
    dailyTrends,
    statusBreakdown,
    customerInsights,
    servicePopularity,
    timeSlotAnalysis,
    comparisonMetrics,
    dateRange,
}) {
    const [dateStart, setDateStart] = useState(dateRange.start);
    const [dateEnd, setDateEnd] = useState(dateRange.end);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            no_show: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
        };
        return colors[status] || colors.pending;
    };

    const handleExport = () => {
        window.location.href = route('appointments.analytics.export', {
            start_date: dateStart,
            end_date: dateEnd,
        });
    };

    const handleDateFilter = () => {
        window.location.href = route('appointments.analytics', {
            start_date: dateStart,
            end_date: dateEnd,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Appointment Analytics" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <Link
                                    href={route('appointments.index')}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <IconArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
                                </Link>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                        Appointment Analytics
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Performance metrics and insights
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleExport}
                                className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                            >
                                <IconDownload className="w-4 h-4 mr-2" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={dateStart}
                                    onChange={(e) => setDateStart(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={dateEnd}
                                    onChange={(e) => setDateEnd(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>
                            <button
                                onClick={handleDateFilter}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    {/* C1: Conversion Stats */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Conversion Metrics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Appointments */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Total Appointments
                                    </span>
                                    <IconCalendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {conversionStats.total_appointments}
                                </p>
                            </div>

                            {/* Converted */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Converted
                                    </span>
                                    <IconCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {conversionStats.converted_appointments}
                                </p>
                            </div>

                            {/* Conversion Rate */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-sm rounded-xl border border-green-200 dark:border-green-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-green-700 dark:text-green-300">
                                        Conversion Rate
                                    </span>
                                    <IconTrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                    {formatPercent(conversionStats.conversion_rate)}
                                </p>
                            </div>

                            {/* Completed */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Completed
                                    </span>
                                    <IconCheck className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {conversionStats.completed}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* C2: Revenue Stats */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Revenue Analytics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Revenue */}
                            <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 shadow-sm rounded-xl border border-primary-200 dark:border-primary-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-primary-700 dark:text-primary-300">
                                        Total Revenue
                                    </span>
                                    <IconCurrencyDollar className="w-5 h-5 text-primary-600" />
                                </div>
                                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                                    {formatPrice(revenueStats.total_revenue)}
                                </p>
                            </div>

                            {/* Appointment Revenue */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Appointment Revenue
                                    </span>
                                    <IconCalendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(revenueStats.appointment_revenue)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {formatPercent(revenueStats.appointment_revenue_percent)} of total
                                </p>
                            </div>

                            {/* Walk-in Revenue */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Walk-in Revenue
                                    </span>
                                    <IconUsers className="w-5 h-5 text-slate-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(revenueStats.walk_in_revenue)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {formatPercent(100 - revenueStats.appointment_revenue_percent)} of total
                                </p>
                            </div>

                            {/* Average Value */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Avg Appointment Value
                                    </span>
                                    <IconChartBar className="w-5 h-5 text-indigo-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(revenueStats.avg_appointment_value)}
                                </p>
                            </div>
                        </div>

                        {/* Deposits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Total Deposits
                                    </span>
                                    <IconCurrencyDollar className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(revenueStats.total_deposits)}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Outstanding Deposits
                                    </span>
                                    <IconAlertCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(revenueStats.outstanding_deposits)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* C3: Staff Performance */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Staff Performance
                        </h2>
                        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Staff Name
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Appointments
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Completed
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Fulfillment Rate
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Services
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Revenue
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {staffPerformance.map((staff) => (
                                            <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                    {staff.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                    {staff.appointments_count}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                    {staff.completed_count}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                                        staff.fulfillment_rate >= 80
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : staff.fulfillment_rate >= 60
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {formatPercent(staff.fulfillment_rate)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                    {staff.services_count}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">
                                                    {formatPrice(staff.revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                        {staffPerformance.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                                    No staff performance data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Status Breakdown
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getStatusColor('pending')}`}>
                                    Pending
                                </span>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {conversionStats.pending}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getStatusColor('confirmed')}`}>
                                    Confirmed
                                </span>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {conversionStats.confirmed}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getStatusColor('completed')}`}>
                                    Completed
                                </span>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {conversionStats.completed}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getStatusColor('cancelled')}`}>
                                    Cancelled
                                </span>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {conversionStats.cancelled}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getStatusColor('no_show')}`}>
                                    No Show
                                </span>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {conversionStats.no_show}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* G: Comparison Metrics */}
                    {comparisonMetrics && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Period Comparison
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Appointments
                                        </span>
                                        {comparisonMetrics.changes.appointments >= 0 ? (
                                            <IconTrendingUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <IconTrendingDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {comparisonMetrics.current.appointments}
                                    </p>
                                    <p className={`text-sm mt-1 ${
                                        comparisonMetrics.changes.appointments >= 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {comparisonMetrics.changes.appointments > 0 ? '+' : ''}
                                        {formatPercent(comparisonMetrics.changes.appointments)} vs previous period
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Revenue
                                        </span>
                                        {comparisonMetrics.changes.revenue >= 0 ? (
                                            <IconTrendingUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <IconTrendingDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatPrice(comparisonMetrics.current.revenue)}
                                    </p>
                                    <p className={`text-sm mt-1 ${
                                        comparisonMetrics.changes.revenue >= 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {comparisonMetrics.changes.revenue > 0 ? '+' : ''}
                                        {formatPercent(comparisonMetrics.changes.revenue)} vs previous period
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Completed
                                        </span>
                                        {comparisonMetrics.changes.completed >= 0 ? (
                                            <IconTrendingUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <IconTrendingDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {comparisonMetrics.current.completed}
                                    </p>
                                    <p className={`text-sm mt-1 ${
                                        comparisonMetrics.changes.completed >= 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {comparisonMetrics.changes.completed > 0 ? '+' : ''}
                                        {formatPercent(comparisonMetrics.changes.completed)} vs previous period
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* G1: Customer Insights */}
                    {customerInsights && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Customer Insights
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            New Customers
                                        </span>
                                        <IconUserPlus className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {customerInsights.new_customers}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Returning Customers
                                        </span>
                                        <IconUserCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {customerInsights.returning_customers}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Retention Rate
                                        </span>
                                        <IconAward className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatPercent(customerInsights.retention_rate)}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Avg Lifetime Value
                                        </span>
                                        <IconCurrencyDollar className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatPrice(customerInsights.avg_lifetime_value)}
                                    </p>
                                </div>
                            </div>

                            {/* Top Customers */}
                            {customerInsights.top_customers && customerInsights.top_customers.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                            Top Customers by Revenue
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-800">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                        Customer
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                        Tier
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                        Transactions
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                        Revenue
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {customerInsights.top_customers.map((customer, index) => (
                                                    <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                            {customer.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                                                customer.loyalty_tier === 'platinum'
                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                                    : customer.loyalty_tier === 'gold'
                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                    : customer.loyalty_tier === 'silver'
                                                                    ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                            }`}>
                                                                {customer.loyalty_tier ? customer.loyalty_tier.charAt(0).toUpperCase() + customer.loyalty_tier.slice(1) : 'Bronze'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                            {customer.transaction_count}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">
                                                            {formatPrice(customer.total_revenue)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* G2: Service Popularity */}
                    {servicePopularity && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Service Performance
                            </h2>
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                    Service Name
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                    Price
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                    Bookings
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                    Total Revenue
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {servicePopularity.services && servicePopularity.services.length > 0 ? (
                                                servicePopularity.services.map((service) => (
                                                    <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                            <div className="flex items-center gap-2">
                                                                <IconStar className="w-4 h-4 text-amber-500" />
                                                                {service.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                            {formatPrice(service.price)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                            {service.booking_count}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">
                                                            {formatPrice(service.total_revenue)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                                        No service data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* G3: Time Slot Analysis */}
                    {timeSlotAnalysis && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Time Slot Analysis
                            </h2>

                            {/* Peak Hours */}
                            {timeSlotAnalysis.peak_hours && timeSlotAnalysis.peak_hours.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                        Peak Hours
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {timeSlotAnalysis.peak_hours.map((slot, index) => (
                                            <div key={slot.time_slot} className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 shadow-sm rounded-xl border border-primary-200 dark:border-primary-800 p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-primary-700 dark:text-primary-300">
                                                        #{index + 1} Peak Time
                                                    </span>
                                                    <IconClockHour4 className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                                                    {slot.time_slot}
                                                </p>
                                                <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                                                    {slot.count} appointments
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Day of Week Analysis */}
                            {timeSlotAnalysis.day_of_week && timeSlotAnalysis.day_of_week.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                        Busiest Days
                                    </h3>
                                    <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-50 dark:bg-slate-800">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                            Day
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                            Appointments
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                            Revenue
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                    {timeSlotAnalysis.day_of_week.map((day) => (
                                                        <tr key={day.day} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                                {day.day}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                                {day.count}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">
                                                                {formatPrice(day.revenue)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
