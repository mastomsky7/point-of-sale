import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CreditCardIcon, PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import MerchantForm from './MerchantForm';

export default function Index({ merchants, canAddMerchant, merchantLimit, currentCount }) {
    const [showForm, setShowForm] = useState(false);
    const [editingMerchant, setEditingMerchant] = useState(null);

    const handleCreate = () => {
        if (!canAddMerchant) {
            Swal.fire({
                icon: 'warning',
                title: 'Merchant Limit Reached',
                html: `You have reached your plan limit (${currentCount}/${merchantLimit} merchants).<br><br>` +
                      '<a href="/upgrade" class="text-blue-600 underline">Upgrade to Enterprise</a> for unlimited merchants.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }
        setEditingMerchant(null);
        setShowForm(true);
    };

    const handleEdit = (merchant) => {
        setEditingMerchant(merchant);
        setShowForm(true);
    };

    const handleDelete = (merchant) => {
        Swal.fire({
            title: 'Delete Merchant?',
            text: `Are you sure you want to delete "${merchant.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('merchants.destroy', merchant.id), {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Merchant has been deleted.', 'success');
                    },
                    onError: (errors) => {
                        Swal.fire('Error', errors.message || 'Failed to delete merchant', 'error');
                    }
                });
            }
        });
    };

    const handleSetDefault = (merchant) => {
        router.post(route('merchants.set-default', merchant.id), {}, {
            onSuccess: () => {
                Swal.fire('Success', 'Default merchant updated', 'success');
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Payment Merchants" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-6">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                                Payment Merchants
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage payment gateway credentials per merchant ({currentCount}/{merchantLimit || '∞'} used)
                            </p>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Merchant
                            </button>
                        </div>
                    </div>

                    {/* Plan Limit Warning */}
                    {!canAddMerchant && (
                        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                        You've reached your merchant limit.
                                        <a href="/upgrade" className="font-medium underline ml-1">Upgrade to Enterprise</a> for unlimited merchants.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Merchants Table */}
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Merchant
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Gateways
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Stores
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {merchants.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2">No merchants yet</p>
                                            <button
                                                onClick={handleCreate}
                                                className="mt-4 text-blue-600 hover:text-blue-800"
                                            >
                                                Create your first merchant
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    merchants.map((merchant) => (
                                        <tr key={merchant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {merchant.name}
                                                            {merchant.is_default && (
                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        {merchant.description && (
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {merchant.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">{merchant.merchant_code}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    {merchant.midtrans_enabled && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Midtrans
                                                        </span>
                                                    )}
                                                    {merchant.xendit_enabled && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                            Xendit
                                                        </span>
                                                    )}
                                                    {!merchant.midtrans_enabled && !merchant.xendit_enabled && (
                                                        <span className="text-sm text-gray-400">None</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {merchant.is_active ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {merchant.stores_count} store{merchant.stores_count !== 1 ? 's' : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    {!merchant.is_default && (
                                                        <button
                                                            onClick={() => handleSetDefault(merchant)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            title="Set as default"
                                                        >
                                                            <CheckCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(merchant)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(merchant)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Merchant Form Modal */}
            {showForm && (
                <MerchantForm
                    merchant={editingMerchant}
                    onClose={() => setShowForm(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
