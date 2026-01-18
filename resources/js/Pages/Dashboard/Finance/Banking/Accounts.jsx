import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconBuildingBank,
    IconPlus,
    IconPencil,
    IconTrash,
    IconEye,
    IconEyeOff,
    IconCheck,
    IconX,
    IconCreditCard,
    IconWallet,
} from '@tabler/icons-react';

export default function Accounts({ auth, title, accounts, stats }) {
    const [showBalance, setShowBalance] = useState({});

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatAccountNumber = (accountNumber, show = false) => {
        if (!accountNumber) return '-';
        if (show) return accountNumber;

        const visible = accountNumber.slice(-4);
        const hidden = '*'.repeat(accountNumber.length - 4);
        return `${hidden}${visible}`;
    };

    const toggleBalanceVisibility = (accountId) => {
        setShowBalance(prev => ({
            ...prev,
            [accountId]: !prev[accountId]
        }));
    };

    const getAccountTypeLabel = (type) => {
        const labels = {
            'checking': 'Giro',
            'savings': 'Tabungan',
            'credit': 'Kartu Kredit',
            'investment': 'Investasi',
        };
        return labels[type] || type;
    };

    const getAccountTypeIcon = (type) => {
        const icons = {
            'checking': IconBuildingBank,
            'savings': IconWallet,
            'credit': IconCreditCard,
            'investment': IconBuildingBank,
        };
        return icons[type] || IconBuildingBank;
    };

    const getStatusBadge = (isActive) => {
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
                {isActive ? 'Aktif' : 'Nonaktif'}
            </span>
        );
    };

    const handleDelete = (id, accountName) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun ${accountName}?`)) {
            router.delete(route('finance.bank-accounts.destroy', id), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    alert('Akun bank berhasil dihapus');
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
                                Akun Bank
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Kelola akun bank dan saldo Anda
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('finance.bank-accounts.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                <IconPlus className="w-5 h-5 mr-2" />
                                Tambah Akun
                            </Link>
                            <Link
                                href={route('finance.dashboard')}
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
                                        Total Akun
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {stats?.total_accounts || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                                    <IconBuildingBank className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Saldo Total
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                        {formatCurrency(stats?.total_balance || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                                    <IconWallet className="w-6 h-6 text-green-600 dark:text-green-300" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Akun Aktif
                                    </p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                                        {stats?.active_accounts || 0}
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
                                        Perlu Rekonsiliasi
                                    </p>
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                                        {stats?.needs_reconciliation || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                                    <IconX className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Accounts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {accounts?.map((account) => {
                            const TypeIcon = getAccountTypeIcon(account.account_type);
                            const isBalanceVisible = showBalance[account.id];

                            return (
                                <div
                                    key={account.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                                >
                                    {/* Account Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                                                <TypeIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {account.bank_name}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {account.account_holder}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(account.is_active)}
                                    </div>

                                    {/* Account Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Nomor Rekening</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                                                    {formatAccountNumber(account.account_number, isBalanceVisible)}
                                                </span>
                                                <button
                                                    onClick={() => toggleBalanceVisibility(account.id)}
                                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    {isBalanceVisible ? (
                                                        <IconEyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <IconEye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Tipe Akun</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {getAccountTypeLabel(account.account_type)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Saldo Saat Ini</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                    {isBalanceVisible ? formatCurrency(account.current_balance) : '••••••••'}
                                                </span>
                                            </div>
                                        </div>

                                        {account.last_reconciled_at && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Rekonsiliasi Terakhir</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {new Date(account.last_reconciled_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={route('finance.reconciliation', account.id)}
                                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-600 dark:border-blue-400 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        >
                                            <IconCheck className="w-4 h-4 mr-1" />
                                            Rekonsiliasi
                                        </Link>
                                        <Link
                                            href={route('finance.bank-accounts.edit', account.id)}
                                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <IconPencil className="w-4 h-4 mr-1" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(account.id, account.bank_name)}
                                            className="inline-flex items-center justify-center px-3 py-2 border border-red-600 dark:border-red-400 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {(!accounts || accounts.length === 0) && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                            <IconBuildingBank className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Belum ada akun bank
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Tambahkan akun bank pertama Anda untuk mulai mengelola keuangan
                            </p>
                            <Link
                                href={route('finance.bank-accounts.create')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                                <IconPlus className="w-5 h-5 mr-2" />
                                Tambah Akun Bank
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}