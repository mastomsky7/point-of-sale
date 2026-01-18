import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconCheck,
    IconX,
    IconAlertTriangle,
    IconRefresh,
    IconDownload,
} from '@tabler/icons-react';

export default function Reconciliation({ auth, title, account, transactions, reconciliation }) {
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [statementBalance, setStatementBalance] = useState('');
    const [statementDate, setStatementDate] = useState(new Date().toISOString().split('T')[0]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const toggleTransaction = (transactionId) => {
        setSelectedTransactions(prev => {
            if (prev.includes(transactionId)) {
                return prev.filter(id => id !== transactionId);
            }
            return [...prev, transactionId];
        });
    };

    const calculateReconciledBalance = () => {
        const reconciledAmount = transactions
            ?.filter(t => selectedTransactions.includes(t.id))
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;

        return (reconciliation?.opening_balance || 0) + reconciledAmount;
    };

    const calculateDifference = () => {
        const reconciledBalance = calculateReconciledBalance();
        const statement = parseFloat(statementBalance) || 0;
        return statement - reconciledBalance;
    };

    const getDifferenceStatus = () => {
        const diff = Math.abs(calculateDifference());
        if (diff === 0) return { color: 'green', label: 'Seimbang', icon: IconCheck };
        if (diff < 1000) return { color: 'yellow', label: 'Hampir Seimbang', icon: IconAlertTriangle };
        return { color: 'red', label: 'Tidak Seimbang', icon: IconX };
    };

    const handleReconcile = () => {
        if (!statementBalance) {
            alert('Masukkan saldo statement bank');
            return;
        }

        const diff = calculateDifference();
        if (diff !== 0) {
            if (!confirm(`Terdapat selisih ${formatCurrency(Math.abs(diff))}. Lanjutkan rekonsiliasi?`)) {
                return;
            }
        }

        router.post(route('finance.reconciliation.store', account?.id), {
            statement_balance: statementBalance,
            statement_date: statementDate,
            reconciled_transactions: selectedTransactions,
            difference: diff,
        }, {
            onSuccess: () => {
                alert('Rekonsiliasi berhasil disimpan');
                setSelectedTransactions([]);
                setStatementBalance('');
            },
        });
    };

    const status = getDifferenceStatus();
    const StatusIcon = status.icon;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Rekonsiliasi Bank
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {account?.bank_name} - {account?.account_number}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.reload()}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <IconRefresh className="w-5 h-5 mr-2" />
                                Refresh
                            </button>
                            <Link
                                href={route('finance.bank-accounts')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <IconArrowLeft className="w-5 h-5 mr-2" />
                                Kembali
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Transactions List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Transaksi Belum Direkonsiliasi
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Pilih transaksi yang sudah muncul di statement bank
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedTransactions(transactions?.map(t => t.id) || []);
                                                            } else {
                                                                setSelectedTransactions([]);
                                                            }
                                                        }}
                                                        checked={selectedTransactions.length === transactions?.length && transactions?.length > 0}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Tanggal
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Deskripsi
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Referensi
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Jumlah
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {transactions?.map((transaction) => (
                                                <tr
                                                    key={transaction.id}
                                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                                        selectedTransactions.includes(transaction.id)
                                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                                            : ''
                                                    }`}
                                                    onClick={() => toggleTransaction(transaction.id)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTransactions.includes(transaction.id)}
                                                            onChange={() => toggleTransaction(transaction.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                        {transaction.description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                        {transaction.reference_number || '-'}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                                                        transaction.amount >= 0
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {formatCurrency(transaction.amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {(!transactions || transactions.length === 0) && (
                                    <div className="p-12 text-center">
                                        <IconCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Semua transaksi sudah direkonsiliasi
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reconciliation Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                    Ringkasan Rekonsiliasi
                                </h2>

                                <div className="space-y-4">
                                    {/* Statement Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tanggal Statement
                                        </label>
                                        <input
                                            type="date"
                                            value={statementDate}
                                            onChange={(e) => setStatementDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>

                                    {/* Statement Balance */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Saldo Statement Bank
                                        </label>
                                        <input
                                            type="number"
                                            value={statementBalance}
                                            onChange={(e) => setStatementBalance(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Saldo Awal</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(reconciliation?.opening_balance || 0)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Transaksi Dipilih</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {selectedTransactions.length}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Saldo Direkonsiliasi</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(calculateReconciledBalance())}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Saldo Statement</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(parseFloat(statementBalance) || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Difference Status */}
                                    <div className={`p-4 rounded-lg border-2 ${
                                        status.color === 'green'
                                            ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-400'
                                            : status.color === 'yellow'
                                            ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-400'
                                            : 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-400'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Status
                                            </span>
                                            <StatusIcon className={`w-5 h-5 ${
                                                status.color === 'green'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : status.color === 'yellow'
                                                    ? 'text-yellow-600 dark:text-yellow-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`} />
                                        </div>
                                        <p className={`text-lg font-bold ${
                                            status.color === 'green'
                                                ? 'text-green-600 dark:text-green-400'
                                                : status.color === 'yellow'
                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {status.label}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Selisih: {formatCurrency(Math.abs(calculateDifference()))}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 pt-4">
                                        <button
                                            onClick={handleReconcile}
                                            disabled={!statementBalance || selectedTransactions.length === 0}
                                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <IconCheck className="w-5 h-5 mr-2" />
                                            Simpan Rekonsiliasi
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedTransactions([]);
                                                setStatementBalance('');
                                            }}
                                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <IconX className="w-5 h-5 mr-2" />
                                            Reset
                                        </button>

                                        <button
                                            onClick={() => window.print()}
                                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <IconDownload className="w-5 h-5 mr-2" />
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}