import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
    IconTable,
    IconFilter,
    IconSearch,
    IconCalendar,
    IconDownload,
    IconArrowUp,
    IconArrowDown,
    IconChevronLeft,
    IconChevronRight,
} from '@tabler/icons-react';

export default function GeneralLedger({ auth, title, entries, accounts, filters }) {
    const [selectedAccount, setSelectedAccount] = useState(filters?.account_id || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

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

    // Handle filter
    const handleFilter = () => {
        router.get('/finance/general-ledger', {
            account_id: selectedAccount,
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset filters
    const handleResetFilters = () => {
        setSelectedAccount('');
        setStartDate('');
        setEndDate('');
        router.get('/finance/general-ledger', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Export to CSV
    const handleExport = () => {
        // TODO: Implement export functionality
        alert('Export functionality will be implemented');
    };

    // Calculate running balance
    const calculateRunningBalance = () => {
        let balance = 0;
        return entries.data?.map(entry => {
            if (entry.type === 'debit') {
                balance += parseFloat(entry.amount);
            } else {
                balance -= parseFloat(entry.amount);
            }
            return { ...entry, running_balance: balance };
        }) || [];
    };

    const entriesWithBalance = calculateRunningBalance();

    // Calculate totals
    const totals = {
        debit: entries.data?.filter(e => e.type === 'debit').reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
        credit: entries.data?.filter(e => e.type === 'credit').reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={title || 'General Ledger'} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                                <IconTable size={32} className="text-primary-600 dark:text-primary-400" />
                                General Ledger
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                Complete view of all financial transactions and accounts
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                <IconDownload size={20} />
                                Export
                            </button>
                            <Link
                                href="/finance/journal-entries"
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                            >
                                View Journal Entries
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Account
                            </label>
                            <select
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">All Accounts</option>
                                {accounts?.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.code} - {account.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Start Date
                            </label>
                            <div className="relative">
                                <IconCalendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                End Date
                            </label>
                            <div className="relative">
                                <IconCalendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Actions
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleFilter}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                >
                                    <IconFilter size={16} />
                                    Apply
                                </button>
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Debits</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(totals.debit)}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <IconArrowUp size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Credits</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(totals.credit)}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                                <IconArrowDown size={24} className="text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Net Balance</p>
                                <p className={`text-2xl font-bold ${totals.debit - totals.credit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(totals.debit - totals.credit)}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${totals.debit - totals.credit >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                {totals.debit - totals.credit >= 0 ? (
                                    <IconArrowUp size={24} className="text-green-600 dark:text-green-400" />
                                ) : (
                                    <IconArrowDown size={24} className="text-red-600 dark:text-red-400" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ledger Entries Table */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Account
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Debit
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Credit
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {entriesWithBalance.length > 0 ? (
                                    entriesWithBalance.map((entry, index) => (
                                        <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                                                {formatDate(entry.entry_date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {entry.account?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        {entry.account?.code}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                                {entry.description || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {entry.type === 'debit' ? (
                                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                        {formatCurrency(entry.amount)}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {entry.type === 'credit' ? (
                                                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                        {formatCurrency(entry.amount)}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`text-sm font-semibold ${entry.running_balance >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-red-600 dark:text-red-400'}`}>
                                                    {formatCurrency(entry.running_balance)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-12 text-center">
                                            <IconTable size={48} className="mx-auto mb-3 text-slate-400 dark:text-slate-600" />
                                            <p className="text-slate-600 dark:text-slate-400">No ledger entries found</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                                                Try adjusting your filters or date range
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {entriesWithBalance.length > 0 && (
                                <tfoot className="bg-slate-50 dark:bg-slate-700/50 border-t-2 border-slate-300 dark:border-slate-600">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                                            Total
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(totals.debit)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-red-600 dark:text-red-400">
                                            {formatCurrency(totals.credit)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(totals.debit - totals.credit)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Pagination */}
                    {entries.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Showing <span className="font-medium">{entries.from}</span> to{' '}
                                    <span className="font-medium">{entries.to}</span> of{' '}
                                    <span className="font-medium">{entries.total}</span> entries
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={entries.prev_page_url || '#'}
                                        disabled={!entries.prev_page_url}
                                        className={`px-3 py-1.5 rounded-lg border transition-colors ${
                                            entries.prev_page_url
                                                ? 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                : 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <IconChevronLeft size={16} />
                                    </Link>
                                    <Link
                                        href={entries.next_page_url || '#'}
                                        disabled={!entries.next_page_url}
                                        className={`px-3 py-1.5 rounded-lg border transition-colors ${
                                            entries.next_page_url
                                                ? 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                : 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <IconChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
