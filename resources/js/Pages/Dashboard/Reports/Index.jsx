import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    IconCash,
    IconShoppingCart,
    IconUsers,
    IconChartBar,
    IconFileInvoice,
    IconPackage,
    IconTrendingUp,
} from '@tabler/icons-react';

export default function ReportIndex({ auth, summary, dateRange }) {
    const [startDate, setStartDate] = useState(dateRange.start);
    const [endDate, setEndDate] = useState(dateRange.end);

    const handleFilter = () => {
        window.location.href = `/dashboard/reports?start_date=${startDate}&end_date=${endDate}`;
    };

    const reportCards = [
        {
            title: 'Laporan Penjualan',
            description: 'Analisis penjualan berdasarkan periode, metode pembayaran, dan kasir',
            icon: IconCash,
            color: 'blue',
            link: '/dashboard/reports/sales',
            value: `Rp ${summary.total_sales?.toLocaleString('id-ID') || 0}`,
            label: 'Total Penjualan',
        },
        {
            title: 'Laporan Produk',
            description: 'Produk terlaris, per kategori, dan stok rendah',
            icon: IconPackage,
            color: 'green',
            link: '/dashboard/reports/products',
            value: `${summary.total_transactions || 0}`,
            label: 'Total Transaksi',
        },
        {
            title: 'Laporan Pelanggan',
            description: 'Pelanggan teratas, akuisisi pelanggan baru, dan loyalitas',
            icon: IconUsers,
            color: 'purple',
            link: '/dashboard/reports/customers',
            value: `${summary.total_customers || 0}`,
            label: 'Pelanggan Baru',
        },
        {
            title: 'Laporan Keuntungan',
            description: 'Analisis profit berdasarkan produk, kategori, dan periode',
            icon: IconTrendingUp,
            color: 'amber',
            link: '/dashboard/reports/profit',
            value: `Rp ${summary.total_profit?.toLocaleString('id-ID') || 0}`,
            label: 'Total Profit',
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Laporan
                </h2>
            }
        >
            <Head title="Laporan" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Date Filter */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Akhir
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={handleFilter}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Report Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reportCards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={index}
                                    href={`${card.link}?start_date=${startDate}&end_date=${endDate}`}
                                    className="block"
                                >
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition group">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`p-2 rounded-lg bg-${card.color}-100`}>
                                                            <Icon
                                                                size={24}
                                                                className={`text-${card.color}-600`}
                                                            />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {card.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-4">
                                                        {card.description}
                                                    </p>
                                                    <div className="mt-4">
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            {card.value}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {card.label}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-gray-400 group-hover:text-gray-600 transition">
                                                    <IconChartBar size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Info Section */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <IconFileInvoice size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">
                                    Tentang Laporan
                                </h4>
                                <p className="text-sm text-blue-800">
                                    Sistem laporan menyediakan analisis lengkap untuk membantu Anda memahami
                                    performa bisnis. Setiap laporan dapat difilter berdasarkan periode waktu
                                    dan diekspor ke format PDF untuk dokumentasi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
