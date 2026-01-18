import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';

export default function Receive({ auth, title, invoices }) {
    const [formData, setFormData] = useState({
        invoice_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        notes: '',
    });

    const [errors, setErrors] = useState({});
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleInvoiceChange = (e) => {
        const invoiceId = e.target.value;
        const invoice = invoices?.find(inv => inv.id === parseInt(invoiceId));

        setSelectedInvoice(invoice);
        setFormData({
            ...formData,
            invoice_id: invoiceId,
            amount: invoice?.remaining_amount || '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route('finance.payments.store'), formData, {
            onSuccess: () => {
                alert('Pembayaran berhasil dicatat');
            },
            onError: (errors) => {
                setErrors(errors);
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={title} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Terima Pembayaran
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Catat pembayaran dari pelanggan
                            </p>
                        </div>
                        <Link
                            href={route('finance.payments')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <IconArrowLeft className="w-5 h-5 mr-2" />
                            Kembali
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Payment Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                    Informasi Pembayaran
                                </h2>

                                <div className="space-y-6">
                                    {/* Invoice Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Invoice <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={formData.invoice_id}
                                            onChange={handleInvoiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            required
                                        >
                                            <option value="">Pilih invoice...</option>
                                            {invoices?.map((invoice) => (
                                                <option key={invoice.id} value={invoice.id}>
                                                    {invoice.invoice_number} - {invoice.customer_name} ({formatCurrency(invoice.remaining_amount)})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.invoice_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.invoice_id}</p>
                                        )}
                                    </div>

                                    {/* Payment Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tanggal Pembayaran <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.payment_date}
                                            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            required
                                        />
                                        {errors.payment_date && (
                                            <p className="text-red-600 text-sm mt-1">{errors.payment_date}</p>
                                        )}
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Jumlah Pembayaran <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        {errors.amount && (
                                            <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
                                        )}
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Metode Pembayaran <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={formData.payment_method}
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            required
                                        >
                                            <option value="cash">Tunai</option>
                                            <option value="bank_transfer">Transfer Bank</option>
                                            <option value="credit_card">Kartu Kredit</option>
                                            <option value="e_wallet">E-Wallet</option>
                                        </select>
                                        {errors.payment_method && (
                                            <p className="text-red-600 text-sm mt-1">{errors.payment_method}</p>
                                        )}
                                    </div>

                                    {/* Reference Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nomor Referensi
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.reference_number}
                                            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="Nomor transaksi/referensi"
                                        />
                                        {errors.reference_number && (
                                            <p className="text-red-600 text-sm mt-1">{errors.reference_number}</p>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Catatan
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="Catatan tambahan..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <Link
                                            href={route('finance.payments')}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Batal
                                        </Link>
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                                        >
                                            <IconCheck className="w-5 h-5 mr-2" />
                                            Catat Pembayaran
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Invoice Info Sidebar */}
                        <div className="lg:col-span-1">
                            {selectedInvoice ? (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        Detail Invoice
                                    </h2>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Nomor Invoice</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {selectedInvoice.invoice_number}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Pelanggan</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {selectedInvoice.customer_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoice</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                {formatCurrency(selectedInvoice.total_amount)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Sudah Dibayar</p>
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                                                {formatCurrency(selectedInvoice.paid_amount || 0)}
                                            </p>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Sisa Tagihan</p>
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                                                {formatCurrency(selectedInvoice.remaining_amount)}
                                            </p>
                                        </div>
                                        {selectedInvoice.due_date && (
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Jatuh Tempo</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                                                    {new Date(selectedInvoice.due_date).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        Detail Invoice
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Pilih invoice untuk melihat detailnya
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
