import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    IconTrendingUp,
    IconTrendingDown,
    IconCurrencyDollar,
    IconShoppingCart,
    IconUsers,
    IconCalendar,
    IconChartBar,
    IconPackage,
    IconAlertTriangle,
    IconStar,
    IconAward,
    IconActivity,
} from '@tabler/icons-react';

const formatPrice = (value = 0) =>
    value.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

const formatPercent = (value) => `${value > 0 ? '+' : ''}${value}%`;

export default function BusinessIntelligence({
    auth,
    overview,
    salesTrends,
    topPerformers,
    customerSegmentation,
    growthMetrics,
    inventoryInsights,
    period,
    dateRange,
}) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);

    const handlePeriodChange = (newPeriod) => {
        window.location.href = route('business-intelligence', { period: newPeriod });
    };

    const getTierColor = (tier) => {
        const colors = {
            platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            silver: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
            bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        };
        return colors[tier] || colors.bronze;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Business Intelligence" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                    Business Intelligence
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Comprehensive analytics and insights
                                </p>
                            </div>

                            {/* Period Selector */}
                            <div className="flex gap-2 overflow-x-auto">
                                {['today', 'week', 'month', 'quarter', 'year'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => handlePeriodChange(p)}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                            selectedPeriod === p
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Overview Metrics */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Overview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-sm rounded-xl border border-green-200 dark:border-green-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-green-700 dark:text-green-300">
                                        Total Revenue
                                    </span>
                                    <IconCurrencyDollar className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                    {formatPrice(overview.total_revenue)}
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                    {overview.transaction_count} transactions
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Avg Transaction
                                    </span>
                                    <IconShoppingCart className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatPrice(overview.avg_transaction_value)}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Active Customers
                                    </span>
                                    <IconUsers className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {overview.active_customers}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {overview.new_customers} new customers
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        Fulfillment Rate
                                    </span>
                                    <IconCalendar className="w-5 h-5 text-indigo-600" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {overview.fulfillment_rate}%
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {overview.completed_appointments}/{overview.total_appointments} completed
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Growth Metrics */}
                    {growthMetrics && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Growth Metrics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Revenue Growth
                                        </span>
                                        {growthMetrics.revenue_growth >= 0 ? (
                                            <IconTrendingUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <IconTrendingDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatPercent(growthMetrics.revenue_growth)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        vs previous period
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Transaction Growth
                                        </span>
                                        {growthMetrics.transaction_growth >= 0 ? (
                                            <IconTrendingUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <IconTrendingDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatPercent(growthMetrics.transaction_growth)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        vs previous period
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Customer Growth
                                        </span>
                                        {growthMetrics.customer_growth >= 0 ? (
                                            <IconTrendingUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <IconTrendingDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatPercent(growthMetrics.customer_growth)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        vs previous period
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Performers */}
                    {topPerformers && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Top Performers
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Top Products */}
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <IconPackage className="w-4 h-4" />
                                            Top Products
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {topPerformers.products && topPerformers.products.length > 0 ? (
                                            topPerformers.products.slice(0, 5).map((product, index) => (
                                                <div key={product.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                Qty: {product.total_quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {formatPrice(product.total_revenue)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                                No data available
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Top Services */}
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <IconStar className="w-4 h-4" />
                                            Top Services
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {topPerformers.services && topPerformers.services.length > 0 ? (
                                            topPerformers.services.slice(0, 5).map((service, index) => (
                                                <div key={service.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {service.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {service.booking_count} bookings
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {formatPrice(service.total_revenue)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                                No data available
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Top Staff */}
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <IconAward className="w-4 h-4" />
                                            Top Staff
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {topPerformers.staff && topPerformers.staff.length > 0 ? (
                                            topPerformers.staff.slice(0, 5).map((staff, index) => (
                                                <div key={staff.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {staff.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {staff.appointments_count} appointments
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {formatPrice(staff.revenue)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                                No data available
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customer Segmentation */}
                    {customerSegmentation && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Customer Segmentation
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Loyalty Tier Distribution */}
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                                        Loyalty Tier Distribution
                                    </h3>
                                    <div className="space-y-2">
                                        {customerSegmentation.tier_distribution.map((tier) => (
                                            <div key={tier.tier} className="flex items-center justify-between">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTierColor(tier.tier)}`}>
                                                    {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {tier.count} customers
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Value Segments */}
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                                        Customer Value Segments
                                    </h3>
                                    <div className="space-y-2">
                                        {customerSegmentation.value_segments.map((segment) => (
                                            <div key={segment.segment} className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {segment.segment}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {segment.count} customers
                                                    </p>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {formatPrice(segment.total_revenue)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inventory Insights */}
                    {inventoryInsights && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Inventory Insights
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Total Value
                                        </span>
                                        <IconChartBar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatPrice(inventoryInsights.inventory_value)}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Total Products
                                        </span>
                                        <IconPackage className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {inventoryInsights.total_products}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Low Stock
                                        </span>
                                        <IconAlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {inventoryInsights.low_stock_count}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            Out of Stock
                                        </span>
                                        <IconActivity className="w-5 h-5 text-red-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {inventoryInsights.out_of_stock_count}
                                    </p>
                                </div>
                            </div>

                            {/* Low Stock Items */}
                            {inventoryInsights.low_stock && inventoryInsights.low_stock.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                            Low Stock Alert
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-800">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                        Product
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                        Current Stock
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                        Minimum
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                        Price
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {inventoryInsights.low_stock.map((product) => (
                                                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                                            {product.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                                {product.stock}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                            {product.stock_minimum}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">
                                                            {formatPrice(product.price)}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
