import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { IconArrowLeft, IconUpload, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { confirmDelete, confirmDialog } from '@/Utils/SweetAlertHelper';

export default function ServiceEdit({ auth, service, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        duration: service.duration || 30,
        category_id: service.category_id || '',
        requires_staff: service.requires_staff || false,
        commission_percent: service.commission_percent || 0,
        image: null,
        _method: 'PUT',
    });

    const [imagePreview, setImagePreview] = useState(service.image_url || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = async () => {
        const confirmed = await confirmDialog({
            title: 'Hapus Gambar?',
            text: 'Gambar layanan akan dihapus',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });
        if (confirmed) {
            setImagePreview(null);
            setData('image', null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('services.update', service.id));
    };

    const handleDelete = async () => {
        const confirmed = await confirmDelete(service.name);
        if (confirmed) {
            router.delete(route('services.destroy', service.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Service - ${service.name}`} />

            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('services.index')}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                <IconArrowLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Edit Service
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {service.name}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <IconTrash className="w-4 h-4 mr-2" />
                            Delete Service
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Basic Information
                            </h3>

                            <div className="space-y-4">
                                {/* Service Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Service Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g., Haircut, Manicure, Spa Treatment"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                    )}
                                </div>

                                {/* Category */}
                                {categories && categories.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={data.category_id}
                                            onChange={e => setData('category_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Select a category...</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category_id}</p>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows="4"
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Describe the service..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Duration */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Pricing & Duration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Price (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        min="0"
                                        step="1000"
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="50000"
                                        required
                                    />
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                                    )}
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Duration (minutes) *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.duration}
                                        onChange={e => setData('duration', e.target.value)}
                                        min="5"
                                        step="5"
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.duration && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Staff Requirements */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Staff Requirements
                            </h3>

                            <div className="space-y-4">
                                {/* Requires Staff */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="requires_staff"
                                        checked={data.requires_staff}
                                        onChange={e => setData('requires_staff', e.target.checked)}
                                        className="rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="requires_staff" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        This service requires a staff member
                                    </label>
                                </div>

                                {/* Commission */}
                                {data.requires_staff && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Staff Commission (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.commission_percent}
                                            onChange={e => setData('commission_percent', e.target.value)}
                                            min="0"
                                            max="100"
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="10"
                                        />
                                        {errors.commission_percent && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.commission_percent}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Percentage of service price that staff will receive as commission
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Service Image */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Service Image
                            </h3>

                            <div className="space-y-4">
                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                                        <img
                                            src={imagePreview}
                                            alt="Service preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <IconTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div>
                                    <label className="block">
                                        <span className="sr-only">Choose service image</span>
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <IconUpload className="w-8 h-8 mb-3 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        PNG, JPG, GIF up to 2MB
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                    </label>
                                    {errors.image && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-4">
                            <Link
                                href={route('services.index')}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Updating...' : 'Update Service'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
