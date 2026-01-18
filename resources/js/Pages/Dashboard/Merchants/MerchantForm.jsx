import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export default function MerchantForm({ merchant, onClose }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: merchant?.name || '',
        merchant_code: merchant?.merchant_code || '',
        description: merchant?.description || '',
        midtrans_enabled: merchant?.midtrans_enabled || false,
        midtrans_merchant_id: merchant?.midtrans_merchant_id || '',
        midtrans_server_key: merchant?.midtrans_server_key || '',
        midtrans_client_key: merchant?.midtrans_client_key || '',
        midtrans_is_production: merchant?.midtrans_is_production || false,
        xendit_enabled: merchant?.xendit_enabled || false,
        xendit_api_key: merchant?.xendit_api_key || '',
        xendit_webhook_token: merchant?.xendit_webhook_token || '',
        xendit_public_key: merchant?.xendit_public_key || '',
        xendit_is_production: merchant?.xendit_is_production || false,
        is_active: merchant?.is_active ?? true,
        is_default: merchant?.is_default || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: merchant ? 'Merchant Updated!' : 'Merchant Created!',
                    text: 'Payment merchant has been saved successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                onClose();
            },
            onError: (errors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errors.message || 'Failed to save merchant',
                });
            }
        };

        if (merchant) {
            put(route('merchants.update', merchant.id), options);
        } else {
            post(route('merchants.store'), options);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                {merchant ? 'Edit Merchant' : 'Create New Merchant'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Configure payment gateway credentials for this merchant
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Merchant Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Merchant Code *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.merchant_code}
                                            onChange={(e) => setData('merchant_code', e.target.value.toUpperCase())}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                        {errors.merchant_code && <p className="mt-1 text-sm text-red-600">{errors.merchant_code}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows="2"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>

                                {/* Midtrans Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Midtrans Configuration</h4>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.midtrans_enabled}
                                                onChange={(e) => setData('midtrans_enabled', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Enable</span>
                                        </label>
                                    </div>

                                    {data.midtrans_enabled && (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Merchant ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.midtrans_merchant_id}
                                                    onChange={(e) => setData('midtrans_merchant_id', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Server Key
                                                </label>
                                                <input
                                                    type="password"
                                                    value={data.midtrans_server_key}
                                                    onChange={(e) => setData('midtrans_server_key', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Client Key
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.midtrans_client_key}
                                                    onChange={(e) => setData('midtrans_client_key', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.midtrans_is_production}
                                                        onChange={(e) => setData('midtrans_is_production', e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Production Mode</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Xendit Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Xendit Configuration</h4>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.xendit_enabled}
                                                onChange={(e) => setData('xendit_enabled', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Enable</span>
                                        </label>
                                    </div>

                                    {data.xendit_enabled && (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    API Key
                                                </label>
                                                <input
                                                    type="password"
                                                    value={data.xendit_api_key}
                                                    onChange={(e) => setData('xendit_api_key', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.xendit_is_production}
                                                        onChange={(e) => setData('xendit_is_production', e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Production Mode</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Active</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_default}
                                                onChange={(e) => setData('is_default', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Set as Default</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : (merchant ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
