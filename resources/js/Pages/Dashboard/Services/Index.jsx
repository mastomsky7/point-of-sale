import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconClock, IconCurrencyDollar, IconSearch } from '@tabler/icons-react';
import { confirmDelete } from '@/Utils/SweetAlertHelper';

export default function ServicesIndex({ auth, services, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('services.index'), {
            search,
            category_id: categoryFilter
        }, { preserveState: true });
    };

    const handleDelete = async (service) => {
        const confirmed = await confirmDelete(service.name);
        if (confirmed) {
            router.delete(route('services.destroy', service.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Services" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Service Management
                        </h1>
                        <Link
                            href={route('services.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Add Service
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IconSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search services..."
                                        className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            {categories && categories.length > 0 && (
                                <div className="w-48">
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.data && services.data.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">No services found</p>
                                <Link
                                    href={route('services.create')}
                                    className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                >
                                    <IconPlus className="w-4 h-4 mr-1" />
                                    Create your first service
                                </Link>
                            </div>
                        ) : (
                            services.data && services.data.map((service) => (
                                <div
                                    key={service.id}
                                    className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {/* Service Image */}
                                    {service.image_url && (
                                        <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                                            <img
                                                src={service.image_url}
                                                alt={service.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {/* Category Badge */}
                                        {service.category && (
                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 rounded-full mb-2">
                                                {service.category.name}
                                            </span>
                                        )}

                                        {/* Service Name */}
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            {service.name}
                                        </h3>

                                        {/* Description */}
                                        {service.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                                {service.description}
                                            </p>
                                        )}

                                        {/* Service Details */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <IconCurrencyDollar className="w-4 h-4 mr-1" />
                                                    Price
                                                </span>
                                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                    Rp {parseFloat(service.price).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <IconClock className="w-4 h-4 mr-1" />
                                                    Duration
                                                </span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {service.duration} minutes
                                                </span>
                                            </div>
                                            {service.commission_percent > 0 && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Commission
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {service.commission_percent}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Requires Staff Badge */}
                                        {service.requires_staff && (
                                            <div className="mb-4">
                                                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
                                                    Requires Staff
                                                </span>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <Link
                                                href={route('services.edit', service.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <IconEdit className="w-4 h-4 mr-1" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(service)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <IconTrash className="w-4 h-4 mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {services.links && services.links.length > 3 && (
                        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing <span className="font-medium">{services.from}</span> to{' '}
                                    <span className="font-medium">{services.to}</span> of{' '}
                                    <span className="font-medium">{services.total}</span> results
                                </div>
                                <div className="flex space-x-2">
                                    {services.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
