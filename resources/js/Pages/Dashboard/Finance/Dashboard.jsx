import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    IconChartLine,
    IconWallet,
    IconReceipt,
    IconCreditCard,
    IconTrendingUp,
    IconBuildingBank,
    IconAlertCircle,
    IconClock,
    IconArrowUpRight,
    IconArrowDownRight,
    IconPlus,
} from '@tabler/icons-react';

export default function Dashboard({ auth, title, summary, pendingInvoices, overdueInvoices, pendingExpenses, recentTransactions }) {
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Calculate net income
    const netIncome = (summary?.monthly_revenue || 0) - (summary?.monthly_expenses || 0);

    const stats = [
        {
            title: 'Total Assets',
            value: formatCurrency(summary?.total_assets || 0),
            icon: IconWallet,
            color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
            change: null,
        },
        {
            title: 'Total Liabilities',
            value: formatCurrency(summary?.total_liabilities || 0),
            icon: IconCreditCard,
            color: 'text-red-600 bg-red-100 dark:bg-red-900/20',
            change: null,
        },
        {
            title: 'Equity',
            value: formatCurrency(summary?.total_equity || 0),
            icon: IconBuildingBank,
            color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
            change: null,
        },
        {
            title: 'Net Income',
            value: formatCurrency(netIncome),
            icon: netIncome >= 0 ? IconArrowUpRight : IconArrowDownRight,
            color: netIncome >= 0 ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : 'text-red-600 bg-red-100 dark:bg-red-900/20',
            change: null,
        },
    ];

    const alerts = [
        {
            title: 'Pending Invoices',
            count: pendingInvoices || 0,
            icon: IconReceipt,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
            link: '/finance/invoices?payment_status=unpaid',
        },
        {
            title: 'Overdue Invoices',
            count: overdueInvoices || 0,
            icon: IconAlertCircle,
            color: 'text-red-600 bg-red-50 dark:bg-red-900/20',
            link: '/finance/invoices?overdue=true',
        },
        {
            title: 'Pending Expenses',
            count: pendingExpenses || 0,
            icon: IconClock,
            color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
            link: '/finance/expenses?is_approved=false',
        },
    ];

    const quickActions = [
        {
            title: 'Create Invoice',
            description: 'Generate new customer invoices',
            icon: IconReceipt,
            link: '/finance/invoices/create',
            color: 'text-blue-600 dark:text-blue-400',
        },
        {
            title: 'Record Payment',
            description: 'Log received payments',
            icon: IconCreditCard,
            link: '/finance/payments/receive',
            color: 'text-green-600 dark:text-green-400',
        },
        {
            title: 'Add Expense',
            description: 'Track business expenses',
            icon: IconTrendingUp,
            link: '/finance/expenses/create',
            color: 'text-orange-600 dark:text-orange-400',
        },
    ];

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={title || 'Finance Dashboard'} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <IconChartLine size={32} className="text-primary-600 dark:text-primary-400" />
                        Finance Dashboard
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Overview of your financial performance and key metrics
                    </p>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Revenue vs Expenses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Monthly Revenue</h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(summary?.monthly_revenue || 0)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            Total revenue for current period
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Monthly Expenses</h3>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(summary?.monthly_expenses || 0)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            Total expenses for current period
                        </p>
                    </div>
                </div>

                {/* Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {alerts.map((alert, index) => (
                        <Link
                            key={index}
                            href={alert.link}
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{alert.title}</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{alert.count}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${alert.color}`}>
                                    <alert.icon size={24} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Transactions</h3>
                            <Link
                                href="/finance/general-ledger"
                                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                                View All
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {recentTransactions && recentTransactions.length > 0 ? (
                            recentTransactions.map((transaction) => (
                                <div key={transaction.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {transaction.account?.name || 'Unknown Account'}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {transaction.description || 'No description'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`font-semibold ${
                                                    transaction.type === 'debit'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {transaction.type === 'debit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {formatDate(transaction.entry_date)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                                <IconReceipt size={48} className="mx-auto mb-3 opacity-50" />
                                <p>No recent transactions</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.link}
                                className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${action.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                                        <action.icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {action.title}
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
                                    </div>
                                    <IconPlus size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
