import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconCreditCard,
    IconCash,
    IconBuildingBank,
    IconWallet,
    IconCheck,
    IconX,
    IconToggleLeft,
    IconToggleRight,
    IconStar,
    IconPlus,
    IconPencil,
    IconTrash,
} from '@tabler/icons-react';

export default function Methods({ auth, title, paymentMethods, stats }) {
    const [editingMethod, setEditingMethod] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getMethodIcon = (type) => {
        const icons = {
            'cash': IconCash,
            'bank_transfer': IconBuildingBank,
            'credit_card': IconCreditCard,
            'e_wallet': IconWallet,
        };
        return icons[type] || IconCreditCard;
    };

    const getMethodLabel = (type) => {
        const labels = {
            'cash': 'Tunai',
            'bank_transfer': 'Transfer Bank',
            'credit_card': 'Kartu Kredit',
            'e_wallet': 'E-Wallet',
        };
        return labels[type] || type;
    };

    const handleToggleStatus = (id, currentStatus) => {
        if (confirm(`${currentStatus === 'active' ? 'Nonaktifkan' : 'Aktifkan'} metode pembayaran ini?`)) {
            router.post(route('finance.payment-methods.toggle', id), {
                status: currentStatus === 'active' ? 'inactive' : 'active'
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleSetDefault = (id) => {
        if (confirm('Jadikan metode pembayaran default?')) {
            router.post(route('finance.payment-methods.set-default', id), {}, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    alert('Metode pembayaran default berhasil diubah');
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) {
            router.delete(route('finance.payment-methods.destroy', id), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    alert('Metode pembayaran berhasil dihapus');
                },
            });
        }
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
                                Metode Pembayaran
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Kelola metode pembayaran yang tersedia
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                <IconPlus className="w-5 h-5 mr-2" />
                                Tambah Metode
                            </button>
                            <Link
                                href={route('finance.payments')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <IconArrowLeft className="w-5 h-5 mr-2" />
                                Kembali
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Metode
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats?.total_methods || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                                    <IconCreditCard className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Aktif
                                    </p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                                        {stats?.active_methods || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                                    <IconCheck className="w-6 h-6 text-green-600 dark:text-green-300" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Nonaktif
                                    </p>
                                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                                        {stats?.inactive_methods || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    <IconX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Transaksi
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats?.total_transactions || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                                    <IconWallet className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paymentMethods?.map((method) => {
                            const Icon = getMethodIcon(method.type);
                            return (
                                <div
                                    key={method.id}
                                    className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 transition-all ${
                                        method.is_default
                                            ? 'border-blue-500 dark:border-blue-400'
                                            : 'border-transparent'
                                    }`}
                                >
                                    {/* Method Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-3 rounded-full ${
                                                method.is_active
                                                    ? 'bg-blue-100 dark:bg-blue-900'
                                                    : 'bg-gray-100 dark:bg-gray-700'
                                            }`}>
                                                <Icon className={`w-6 h-6 ${
                                                    method.is_active
                                                        ? 'text-blue-600 dark:text-blue-300'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {method.name || getMethodLabel(method.type)}
                                                </h3>
                                                {method.is_default && (
                                                    <span className="inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
                                                        <IconStar className="w-3 h-3 mr-1 fill-current" />
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleStatus(method.id, method.is_active ? 'active' : 'inactive')}
                                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                        >
                                            {method.is_active ? (
                                                <IconToggleRight className="w-8 h-8 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <IconToggleLeft className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Method Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Tipe</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {getMethodLabel(method.type)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Total Transaksi</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {method.transaction_count || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Total Nilai</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(method.total_amount || 0)}
                                            </span>
                                        </div>
                                        {method.account_number && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">No. Rekening</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {method.account_number}
                                                </span>
                                            </div>
                                        )}
                                        {method.account_name && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Nama Akun</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {method.account_name}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mb-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            method.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                            {method.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        {!method.is_default && method.is_active && (
                                            <button
                                                onClick={() => handleSetDefault(method.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-600 dark:border-blue-400 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            >
                                                <IconStar className="w-4 h-4 mr-1" />
                                                Set Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setEditingMethod(method)}
                                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <IconPencil className="w-4 h-4 mr-1" />
                                            Edit
                                        </button>
                                        {!method.is_default && (
                                            <button
                                                onClick={() => handleDelete(method.id)}
                                                className="inline-flex items-center justify-center px-3 py-2 border border-red-600 dark:border-red-400 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <IconTrash className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {(!paymentMethods || paymentMethods.length === 0) && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                            <IconCreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Belum ada metode pembayaran
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Tambahkan metode pembayaran pertama Anda
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                <IconPlus className="w-5 h-5 mr-2" />
                                Tambah Metode Pembayaran
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}