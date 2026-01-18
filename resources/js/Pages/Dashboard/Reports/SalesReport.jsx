import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    IconDownload,
    IconFileSpreadsheet,
    IconFile,
    IconArrowLeft,
    IconCash,
    IconShoppingCart,
    IconClock,
    IconUser,
} from '@tabler/icons-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function SalesReport({
    auth,
    salesByPeriod,
    salesByPayment,
    salesByCashier,
    salesByHour,
    summary,
    dateRange,
    groupBy,
}) {
    const [startDate, setStartDate] = useState(dateRange.start);
    const [endDate, setEndDate] = useState(dateRange.end);
    const [selectedGroupBy, setSelectedGroupBy] = useState(groupBy);

    const handleFilter = () => {
        window.location.href = `/dashboard/reports/sales-report?start_date=${startDate}&end_date=${endDate}&group_by=${selectedGroupBy}`;
    };

    const handleExport = (type) => {
        const url = `/dashboard/reports/${type === 'excel' ? 'export-excel' : 'export'}?type=sales&start_date=${startDate}&end_date=${endDate}`;
        window.location.href = url;
    };

    // Chart data for sales by period
    const periodChartData = {
        labels: salesByPeriod.map((item) => item.period),
        datasets: [
            {
                label: 'Total Penjualan',
                data: salesByPeriod.map((item) => item.total),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
            },
        ],
    };

    // Chart data for payment methods
    const paymentChartData = {
        labels: salesByPayment.map((item) => item.payment_method.toUpperCase()),
        datasets: [
            {
                label: 'Jumlah Transaksi',
                data: salesByPayment.map((item) => item.count),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Chart data for hourly sales
    const hourlyChartData = {
        labels: salesByHour.map((item) => `${item.hour}:00`),
        datasets: [
            {
                label: 'Total Penjualan per Jam',
                data: salesByHour.map((item) => item.total),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
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
                        Laporan Penjualan
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
            <Head title="Laporan Penjualan" />

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
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Periode
                                    </label>
                                    <select
                                        value={selectedGroupBy}
                                        onChange={(e) => setSelectedGroupBy(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="day">Harian</option>
                                        <option value="week">Mingguan</option>
                                        <option value="month">Bulanan</option>
                                    </select>
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
                                        <IconCash size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Penjualan</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(summary.total_sales || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <IconShoppingCart size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Transaksi</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {summary.total_transactions || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-100 rounded-lg">
                                        <IconShoppingCart size={24} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Rata-rata Transaksi</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(summary.average_transaction || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales by Period */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Penjualan per Periode
                                </h3>
                                <div style={{ height: '300px' }}>
                                    <Bar data={periodChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Sales by Payment Method */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Penjualan per Metode Pembayaran
                                </h3>
                                <div style={{ height: '300px' }}>
                                    <Pie data={paymentChartData} options={{ ...chartOptions, scales: undefined }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Hourly Sales */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Penjualan per Jam
                                </h3>
                                <div style={{ height: '300px' }}>
                                    <Line data={hourlyChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales by Cashier Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Penjualan per Kasir
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nama Kasir
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Jumlah Transaksi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Penjualan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {salesByCashier.map((cashier, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <IconUser size={18} className="text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {cashier.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {cashier.count}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatCurrency(cashier.total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
