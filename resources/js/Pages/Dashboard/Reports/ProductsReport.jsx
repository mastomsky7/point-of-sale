import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    IconDownload,
    IconFileSpreadsheet,
    IconFile,
    IconArrowLeft,
    IconPackage,
    IconTrendingUp,
    IconAlertCircle,
    IconChartBar,
} from '@tabler/icons-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function ProductsReport({
    auth,
    bestSelling,
    productsByCategory,
    lowStock,
    summary,
    dateRange,
}) {
    const [startDate, setStartDate] = useState(dateRange.start);
    const [endDate, setEndDate] = useState(dateRange.end);

    const handleFilter = () => {
        window.location.href = `/dashboard/reports/products-report?start_date=${startDate}&end_date=${endDate}`;
    };

    const handleExport = (type) => {
        const url = `/dashboard/reports/${type === 'excel' ? 'export-excel' : 'export'}?type=products&start_date=${startDate}&end_date=${endDate}`;
        window.location.href = url;
    };

    // Best selling chart
    const bestSellingChartData = {
        labels: bestSelling.slice(0, 10).map((item) => item.title),
        datasets: [
            {
                label: 'Qty Terjual',
                data: bestSelling.slice(0, 10).map((item) => item.total_qty),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
        ],
    };

    // Category chart
    const categoryChartData = {
        labels: productsByCategory.map((item) => item.category),
        datasets: [
            {
                label: 'Total Penjualan',
                data: productsByCategory.map((item) => item.total_sales),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                ],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Laporan Produk
                    </h2>
                    <Link
                        href="/dashboard/reports"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <IconArrowLeft size={20} />
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title="Laporan Produk" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleExport('excel')}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                    >
                                        <IconFileSpreadsheet size={18} />
                                        Excel
                                    </button>
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                                    >
                                        <IconFile size={18} />
                                        PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <IconPackage size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Produk Terjual</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {summary.total_products_sold || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <IconChartBar size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Produk Berbeda</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {summary.unique_products || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <IconAlertCircle size={24} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Stok Rendah</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {summary.low_stock_count || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Best Selling Products */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Top 10 Produk Terlaris
                                </h3>
                                <div style={{ height: '300px' }}>
                                    <Bar data={bestSellingChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Products by Category */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Penjualan per Kategori
                                </h3>
                                <div style={{ height: '300px' }}>
                                    <Pie data={categoryChartData} options={{ ...chartOptions, scales: undefined }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Best Selling Products Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Produk Terlaris
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Nama Produk
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Barcode
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Qty Terjual
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Total Penjualan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Transaksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {bestSelling.map((product, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {product.title}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.barcode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.total_qty}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatCurrency(product.total_sales)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.transaction_count}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Products */}
                    {lowStock.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-2 border-red-200">
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <IconAlertCircle size={24} className="text-red-600" />
                                    <h3 className="text-lg font-semibold text-red-900">
                                        Produk dengan Stok Rendah
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Nama Produk
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Barcode
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Stok Saat Ini
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Stok Minimum
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {lowStock.map((product, index) => (
                                                <tr key={index} className="hover:bg-red-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {product.title}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.barcode}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-red-600">
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.stock_min || 5}
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
            </div>
        </AuthenticatedLayout>
    );
}
