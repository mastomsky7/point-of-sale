import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { LinkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export default function Index({ stores, merchants }) {
    const handleUpdateMapping = (storeId, merchantId) => {
        if (!merchantId) {
            Swal.fire({
                icon: 'warning',
                title: 'No Merchant Selected',
                text: 'Please select a merchant to map to this store.',
            });
            return;
        }

        router.post(route('store-merchants.store'), {
            store_id: storeId,
            merchant_id: merchantId,
        }, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Mapping Updated!',
                    text: 'Store-merchant mapping has been updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            onError: (errors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errors.message || 'Failed to update mapping',
                });
            }
        });
    };

    const handleRemoveMapping = (storeId) => {
        Swal.fire({
            title: 'Remove Mapping?',
            text: 'This store will use the default merchant after removal.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('store-merchants.store'), {
                    store_id: storeId,
                    merchant_id: null,
                }, {
                    onSuccess: () => {
                        Swal.fire('Removed!', 'Mapping has been removed.', 'success');
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Store-Merchant Mapping" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-6">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                                Store-Merchant Mapping
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Assign payment merchants to stores (1 store = 1 merchant)
                            </p>
                        </div>
                    </div>

                    {/* No Merchants Warning */}
                    {merchants.length === 0 && (
                        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                        No merchants available.
                                        <a href="/merchants" className="font-medium underline ml-1">Create a merchant first</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stores Table */}
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Store
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Current Merchant
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {stores.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2">No stores available</p>
                                        </td>
                                    </tr>
                                ) : (
                                    stores.map((store) => (
                                        <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {store.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">{store.code}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {store.merchant ? (
                                                    <div>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                            {store.merchant.name}
                                                        </span>
                                                        {store.merchant.merchant_code && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                Code: {store.merchant.merchant_code}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        Not Mapped
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {store.is_active ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={store.merchant?.id || ''}
                                                        onChange={(e) => handleUpdateMapping(store.id, e.target.value)}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                                        disabled={merchants.length === 0}
                                                    >
                                                        <option value="">-- Select Merchant --</option>
                                                        {merchants.map((merchant) => (
                                                            <option key={merchant.id} value={merchant.id}>
                                                                {merchant.name}
                                                                {merchant.is_default ? ' (Default)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {store.merchant && (
                                                        <button
                                                            onClick={() => handleRemoveMapping(store.id)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Help Text */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">How it works:</h3>
                        <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                            <li>Each store can be mapped to one merchant</li>
                            <li>Transactions from the store will use the mapped merchant's payment credentials</li>
                            <li>If no merchant is mapped, the default merchant will be used</li>
                            <li>You can change the mapping at any time</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
