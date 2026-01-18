import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { IconArrowLeft, IconClock, IconCheck, IconX, IconSearch, IconFilter, IconRefresh, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';

export default function Recurring({ auth, title, invoices, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [selectedFrequency, setSelectedFrequency] = useState(filters?.frequency || '');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleSearch = () => {
        router.get(route('finance.invoices.recurring'), {
            search: searchTerm,
            status: selectedStatus,
            frequency: selectedFrequency,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedFrequency('');
        router.get(route('finance.invoices.recurring'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        if (confirm(`${newStatus === 'active' ? 'Aktifkan' : 'Jeda'} invoice berulang ini?`)) {
            router.post(route('finance.invoices.recurring.toggle', id), { status: newStatus }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleStop = (id) => {
        if (confirm('Hentikan invoice berulang ini secara permanen? Aksi ini tidak dapat dibatalkan.')) {
            router.post(route('finance.invoices.recurring.stop', id), {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'active': {
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-800 dark:text-green-400',
                label: 'Aktif',
                icon: IconCheck
            },
            'paused': {
                bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                text: 'text-yellow-800 dark:text-yellow-400',
                label: 'Dijeda',
                icon: IconClock
            },
            'stopped': {
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-800 dark:text-red-400',
                label: 'Dihentikan',
                icon: IconX
            },
        };

        const badge = badges[status] || badges.active;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-4 h-4 mr-1" />
                {badge.label}
            </span>
        );
    };

    const getFrequencyLabel = (frequency) => {
        const labels = {
            'weekly': 'Mingguan',
            'monthly': 'Bulanan',
            'quarterly': 'Kuartalan',
            'yearly': 'Tahunan',
        };
        return labels[frequency] || frequency;
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
                                Invoice Berulang
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Kelola invoice yang dibuat secara otomatis
                            </p>
                        </div>
                        <Link
                            href={route('finance.invoices')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <IconArrowLeft className="w-5 h-5 mr-2" />
                            Kembali
                        </Link>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Recurring</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats?.total_recurring || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                    <IconRefresh className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Aktif</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                        {stats?.active_count || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatCurrency(stats?.active_amount || 0)}/periode
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                    <IconCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Dijeda</p>
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                                        {stats?.paused_count || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                    <IconClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Dibuat</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                        {stats?.generated_count || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Total: {formatCurrency(stats?.generated_amount || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                    <IconRefresh className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cari
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari pelanggan..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="all">Semua</option>
                                    <option value="active">Aktif</option>
                                    <option value="paused">Dijeda</option>
                                    <option value="stopped">Dihentikan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Frekuensi
                                </label>
                                <select
                                    value={selectedFrequency}
                                    onChange={(e) => setSelectedFrequency(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">Semua Frekuensi</option>
                                    <option value="weekly">Mingguan</option>
                                    <option value="monthly">Bulanan</option>
                                    <option value="quarterly">Kuartalan</option>
                                    <option value="yearly">Tahunan</option>
                                </select>
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

                    {/* Recurring Invoices Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Pelanggan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Frekuensi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Invoice Terakhir
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Invoice Berikutnya
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Jumlah
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {invoices?.data?.length > 0 ? (
                                        invoices.data.map((invoice) => (
                                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="font-medium">{invoice.customer_name}</div>
                                                    {invoice.customer_email && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {invoice.customer_email}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {getFrequencyLabel(invoice.recurring_frequency)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {invoice.last_generated_at ? formatDate(invoice.last_generated_at) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {invoice.next_generation_date ? formatDate(invoice.next_generation_date) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(invoice.total_amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                    {getStatusBadge(invoice.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center space-x-2">
                                                        {invoice.status !== 'stopped' && (
                                                            <button
                                                                onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                {invoice.status === 'active' ? (
                                                                    <IconPlayerPause className="w-5 h-5" />
                                                                ) : (
                                                                    <IconPlayerPlay className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        )}
                                                        <Link
                                                            href={route('finance.invoices.recurring.show', invoice.id)}
                                                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                                        >
                                                            Lihat
                                                        </Link>
                                                        {invoice.status !== 'stopped' && (
                                                            <button
                                                                onClick={() => handleStop(invoice.id)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                Hentikan
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center">
                                                    <IconRefresh className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
                                                    <p className="text-lg font-medium">Tidak ada data</p>
                                                    <p className="text-sm">Belum ada invoice berulang yang dibuat</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {invoices?.data?.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {invoices.prev_page_url && (
                                            <Link
                                                href={invoices.prev_page_url}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Sebelumnya
                                            </Link>
                                        )}
                                        {invoices.next_page_url && (
                                            <Link
                                                href={invoices.next_page_url}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Selanjutnya
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan <span className="font-medium">{invoices.from}</span> sampai{' '}
                                                <span className="font-medium">{invoices.to}</span> dari{' '}
                                                <span className="font-medium">{invoices.total}</span> recurring invoice
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                {invoices.links?.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            link.active
                                                                ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        } ${index === 0 ? 'rounded-l-md' : ''} ${
                                                            index === invoices.links.length - 1 ? 'rounded-r-md' : ''
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
            </div>
        </AuthenticatedLayout>
    );
}
