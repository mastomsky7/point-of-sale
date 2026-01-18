import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { IconPackage, IconArrowLeft, IconDownload, IconAlertCircle } from '@tabler/icons-react';

export default function ProductsReport({ auth, bestSelling, productsByCategory, lowStock, summary, dateRange }) {
    const handleExport = () => {
        window.location.href = `/dashboard/reports/export?type=products&start_date=${dateRange.start}&end_date=${dateRange.end}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Laporan Produk</h2>
                    <div className="flex gap-2">
                        <Link href="/dashboard/reports" className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            <IconArrowLeft size={18} className="mr-2" />
                            Kembali
                        </Link>
                        <button onClick={handleExport} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            <IconDownload size={18} className="mr-2" />
                            Export PDF
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Produk" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Total Produk Terjual</p>
                            <p className="text-2xl font-bold">{summary.total_products_sold || 0}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Produk Unik</p>
                            <p className="text-2xl font-bold">{summary.unique_products || 0}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <p className="text-sm text-gray-600">Stok Rendah</p>
                            <p className="text-2xl font-bold text-red-600">{summary.low_stock_count || 0}</p>
                        </div>
                    </div>

                    {/* Best Selling Products */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <IconPackage size={20} />
                            Produk Terlaris
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Penjualan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bestSelling.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.barcode}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.total_qty}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rp {item.total_sales?.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.transaction_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Products by Category */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Penjualan per Kategori</h3>
                        <div className="space-y-3">
                            {productsByCategory.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.category}</p>
                                        <p className="text-sm text-gray-500">{item.total_qty} unit terjual</p>
                                    </div>
                                    <p className="font-bold text-gray-900">Rp {item.total_sales?.toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    {lowStock.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                                <IconAlertCircle size={20} />
                                Peringatan Stok Rendah
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {lowStock.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">{item.barcode}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600">{item.stock} unit</p>
                                            <p className="text-xs text-gray-500">Min: {item.stock_min || 5}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
