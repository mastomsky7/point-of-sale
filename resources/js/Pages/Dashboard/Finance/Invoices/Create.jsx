import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { IconPlus, IconTrash, IconSave, IconSend, IconArrowLeft } from '@tabler/icons-react';

export default function Create({ auth, title, customers, products, nextInvoiceNumber }) {
    const [formData, setFormData] = useState({
        customer_id: '',
        customer_name: '',
        customer_email: '',
        customer_address: '',
        invoice_number: nextInvoiceNumber || '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        terms: '',
        is_recurring: false,
        recurring_frequency: 'monthly',
    });

    const [items, setItems] = useState([
        { description: '', quantity: 1, unit_price: 0, amount: 0 }
    ]);

    const [errors, setErrors] = useState({});

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        const customer = customers?.find(c => c.id === parseInt(customerId));

        setFormData({
            ...formData,
            customer_id: customerId,
            customer_name: customer?.name || '',
            customer_email: customer?.email || '',
            customer_address: customer?.address || '',
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'unit_price') {
            const quantity = parseFloat(newItems[index].quantity) || 0;
            const unitPrice = parseFloat(newItems[index].unit_price) || 0;
            newItems[index].amount = quantity * unitPrice;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.11; // 11% PPN
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleSubmit = (status = 'draft') => {
        const data = {
            ...formData,
            items: items,
            subtotal: calculateSubtotal(),
            tax_amount: calculateTax(),
            total_amount: calculateTotal(),
            status: status,
        };

        router.post(route('finance.invoices.store'), data, {
            onSuccess: () => {
                alert(`Invoice berhasil ${status === 'draft' ? 'disimpan sebagai draft' : 'dibuat dan dikirim'}`);
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Buat Invoice Baru
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Buat invoice untuk pelanggan
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Invoice Details */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Detail Invoice
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nomor Invoice
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.invoice_number}
                                            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                        {errors.invoice_number && (
                                            <p className="text-red-600 text-sm mt-1">{errors.invoice_number}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tanggal Invoice
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.invoice_date}
                                            onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tanggal Jatuh Tempo
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                        {errors.due_date && (
                                            <p className="text-red-600 text-sm mt-1">{errors.due_date}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Informasi Pelanggan
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Pilih Pelanggan
                                        </label>
                                        <select
                                            value={formData.customer_id}
                                            onChange={handleCustomerChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="">Pilih pelanggan...</option>
                                            {customers?.map((customer) => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.customer_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.customer_id}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nama Pelanggan
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customer_name}
                                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.customer_email}
                                            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Alamat
                                        </label>
                                        <textarea
                                            value={formData.customer_address}
                                            onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Items */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Item Invoice
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                                    >
                                        <IconPlus className="w-4 h-4 mr-2" />
                                        Tambah Item
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="col-span-12 md:col-span-5">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Deskripsi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                    placeholder="Nama produk/jasa"
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Qty
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                    min="1"
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Harga
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="col-span-3 md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Total
                                                </label>
                                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-gray-100 text-sm">
                                                    {formatCurrency(item.amount)}
                                                </div>
                                            </div>
                                            <div className="col-span-1 flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
                                                    className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                                >
                                                    <IconTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes & Terms */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Catatan & Syarat
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Catatan
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="Catatan tambahan untuk pelanggan"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Syarat & Ketentuan
                                        </label>
                                        <textarea
                                            value={formData.terms}
                                            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            placeholder="Syarat pembayaran dan ketentuan lainnya"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Recurring Option */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_recurring}
                                        onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                                        className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Jadikan Invoice Berulang
                                        </label>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Invoice ini akan dibuat secara otomatis sesuai frekuensi yang dipilih
                                        </p>
                                        {formData.is_recurring && (
                                            <div className="mt-3">
                                                <select
                                                    value={formData.recurring_frequency}
                                                    onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })}
                                                    className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                >
                                                    <option value="weekly">Mingguan</option>
                                                    <option value="monthly">Bulanan</option>
                                                    <option value="quarterly">Kuartalan</option>
                                                    <option value="yearly">Tahunan</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Ringkasan
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(calculateSubtotal())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">PPN (11%)</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(calculateTax())}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Total</span>
                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(calculateTotal())}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit('sent')}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                                    >
                                        <IconSend className="w-5 h-5 mr-2" />
                                        Buat & Kirim
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit('draft')}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium"
                                    >
                                        <IconSave className="w-5 h-5 mr-2" />
                                        Simpan Draft
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
