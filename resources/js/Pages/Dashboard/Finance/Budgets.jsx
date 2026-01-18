import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { IconPlus, IconFileDownload, IconAlertTriangle, IconSearch, IconFilter, IconCalculator, IconTrendingUp } from '@tabler/icons-react';

export default function Budgets({ auth, title, budgets, categories, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category_id || '');
    const [selectedPeriod, setSelectedPeriod] = useState(filters?.period || '');
    const [selectedYear, setSelectedYear] = useState(filters?.year || new Date().getFullYear());

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleSearch = () => {
        router.get(route('finance.budgets'), {
            search: searchTerm,
            category_id: selectedCategory,
            period: selectedPeriod,
            year: selectedYear,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedPeriod('');
        setSelectedYear(new Date().getFullYear());
        router.get(route('finance.budgets'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        window.location.href = route('finance.budgets.export', {
            search: searchTerm,
            category_id: selectedCategory,
            period: selectedPeriod,
            year: selectedYear,
        });
    };

    const getUtilizationColor = (percentage) => {
        if (percentage >= 100) return 'text-red-600 dark:text-red-400';
        if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getProgressBarColor = (percentage) => {
        if (percentage >= 100) return 'bg-red-600';
        if (percentage >= 80) return 'bg-yellow-600';
        return 'bg-green-600';
    };

    const getPeriodLabel = (period) => {
        const labels = {
            'monthly': 'Bulanan',
            'quarterly': 'Kuartalan',
            'yearly': 'Tahunan',
        };
        return labels[period] || period;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Manajemen Anggaran
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Kelola dan monitor penggunaan anggaran
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <IconFileDownload className="w-5 h-5 mr-2" />
                                Export
                            </button>
                            <Link
                                href={route('finance.budgets.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                <IconPlus className="w-5 h-5 mr-2" />
                                Anggaran Baru
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Anggaran</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {formatCurrency(stats?.total_budget || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                    <IconCalculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Telah Digunakan</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {formatCurrency(stats?.total_used || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {stats?.average_utilization?.toFixed(1)}% rata-rata
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                    <IconTrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Tersisa</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                        {formatCurrency(stats?.total_remaining || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                    <IconCalculator className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Melebihi Anggaran</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                                        {stats?.exceeded_count || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatCurrency(stats?.exceeded_amount || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <IconAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <div className="flex items-center mb-4">
                            <IconFilter className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filter</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cari
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari deskripsi..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kategori
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories?.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Periode
                                </label>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">Semua Periode</option>
                                    <option value="monthly">Bulanan</option>
                                    <option value="quarterly">Kuartalan</option>
                                    <option value="yearly">Tahunan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tahun
                                </label>
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Bersihkan
                            </button>
                            <button
                                onClick={handleSearch}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                <IconSearch className="w-5 h-5 mr-2" />
                                Cari
                            </button>
                        </div>
                    </div>

                    {/* Budgets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {budgets?.data?.length > 0 ? (
                            budgets.data.map((budget) => {
                                const utilization = budget.budget_amount > 0
                                    ? (budget.used_amount / budget.budget_amount) * 100
                                    : 0;
                                const remaining = budget.budget_amount - budget.used_amount;
                                const isExceeded = utilization >= 100;

                                return (
                                    <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                        {budget.category?.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {getPeriodLabel(budget.period)} - {budget.year}
                                                    </p>
                                                </div>
                                                {isExceeded && (
                                                    <IconAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                                )}
                                            </div>

                                            {/* Budget Info */}
                                            <div className="space-y-3 mb-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Total Anggaran
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(budget.budget_amount)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Telah Digunakan
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(budget.used_amount)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Tersisa
                                                    </span>
                                                    <span className={`text-sm font-medium ${
                                                        isExceeded
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                    }`}>
                                                        {formatCurrency(remaining)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Penggunaan
                                                    </span>
                                                    <span className={`text-sm font-semibold ${getUtilizationColor(utilization)}`}>
                                                        {utilization.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                    <div
                                                        className={`h-2.5 rounded-full ${getProgressBarColor(utilization)}`}
                                                        style={{ width: `${Math.min(utilization, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {budget.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                    {budget.description}
                                                </p>
                                            )}

                                            {/* Actions */}
                                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <Link
                                                    href={route('finance.budgets.show', budget.id)}
                                                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Detail
                                                </Link>
                                                <Link
                                                    href={route('finance.budgets.edit', budget.id)}
                                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Warning Banner for Exceeded Budgets */}
                                        {isExceeded && (
                                            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-3 border-t border-red-200 dark:border-red-800">
                                                <p className="text-sm text-red-800 dark:text-red-400">
                                                    <IconAlertTriangle className="w-4 h-4 inline mr-1" />
                                                    Anggaran telah melebihi batas!
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                                    <IconCalculator className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Tidak ada data</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada anggaran yang dibuat</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {budgets?.data?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3 mt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {budgets.prev_page_url && (
                                        <Link
                                            href={budgets.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Sebelumnya
                                        </Link>
                                    )}
                                    {budgets.next_page_url && (
                                        <Link
                                            href={budgets.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Selanjutnya
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan <span className="font-medium">{budgets.from}</span> sampai{' '}
                                            <span className="font-medium">{budgets.to}</span> dari{' '}
                                            <span className="font-medium">{budgets.total}</span> anggaran
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {budgets.links?.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    } ${index === 0 ? 'rounded-l-md' : ''} ${
                                                        index === budgets.links.length - 1 ? 'rounded-r-md' : ''
                                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
