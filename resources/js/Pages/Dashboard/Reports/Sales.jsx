import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { IconCash, IconTrendingUp, IconDownload, IconArrowLeft } from '@tabler/icons-react';

export default function SalesReport({ auth, salesByPeriod, salesByPayment, salesByCashier, summary, dateRange }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Laporan Penjualan</h2>
                    <div className="flex gap-2">
                        <Link href="/dashboard/reports" className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            <IconArrowLeft size={18} className="mr-2" />
                            Kembali
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Penjualan" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Total Penjualan</p>
                            <p className="text-2xl font-bold">Rp {summary.total_sales?.toLocaleString('id-ID') || 0}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Total Transaksi</p>
                            <p className="text-2xl font-bold">{summary.total_transactions || 0}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Rata-rata</p>
                            <p className="text-2xl font-bold">Rp {Math.round(summary.average_transaction || 0).toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
