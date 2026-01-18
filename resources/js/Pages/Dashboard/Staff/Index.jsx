import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconUser, IconPhone, IconMail, IconStar, IconSearch } from '@tabler/icons-react';
import { confirmDelete } from '@/Utils/SweetAlertHelper';

export default function StaffIndex({ auth, staff, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('staff.index'), { search }, { preserveState: true });
    };

    const handleDelete = async (staffMember) => {
        const confirmed = await confirmDelete(`staff ${staffMember.name}`);
        if (confirmed) {
            router.delete(route('staff.destroy', staffMember.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Staff Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Staff Management
                        </h1>
                        <Link
                            href={route('staff.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Add Staff
                        </Link>
                    </div>

                    {/* Search */}
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
                                        placeholder="Search staff by name, specialization..."
                                        className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Staff Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {staff.data && staff.data.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <IconUser className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-gray-500 dark:text-gray-400">No staff members found</p>
                                <Link
                                    href={route('staff.create')}
                                    className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                >
                                    <IconPlus className="w-4 h-4 mr-1" />
                                    Add your first staff member
                                </Link>
                            </div>
                        ) : (
                            staff.data && staff.data.map((staffMember) => (
                                <div
                                    key={staffMember.id}
                                    className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {/* Staff Photo */}
                                    <div className="h-48 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        {staffMember.photo_url ? (
                                            <img
                                                src={staffMember.photo_url}
                                                alt={staffMember.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <IconUser className="w-24 h-24 text-white opacity-50" />
                                        )}
                                    </div>

                                    <div className="p-6">
                                        {/* Staff Name */}
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                            {staffMember.name}
                                        </h3>

                                        {/* Specialization */}
                                        {staffMember.specialization && (
                                            <div className="flex items-center text-indigo-600 dark:text-indigo-400 mb-4">
                                                <IconStar className="w-4 h-4 mr-1" />
                                                <span className="text-sm font-medium">{staffMember.specialization}</span>
                                            </div>
                                        )}

                                        {/* Contact Information */}
                                        <div className="space-y-2 mb-4">
                                            {staffMember.phone && (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <IconPhone className="w-4 h-4 mr-2" />
                                                    {staffMember.phone}
                                                </div>
                                            )}
                                            {staffMember.email && (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <IconMail className="w-4 h-4 mr-2" />
                                                    {staffMember.email}
                                                </div>
                                            )}
                                        </div>

                                        {/* Commission Rate */}
                                        {staffMember.commission_rate > 0 && (
                                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Commission Rate
                                                    </span>
                                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                        {staffMember.commission_rate}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Working Hours */}
                                        {staffMember.working_hours && (
                                            <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                                                <p className="font-medium mb-1">Working Hours:</p>
                                                <p>{staffMember.working_hours.start || '09:00'} - {staffMember.working_hours.end || '17:00'}</p>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="mb-4">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                staffMember.is_active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                                {staffMember.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <Link
                                                href={route('staff.edit', staffMember.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <IconEdit className="w-4 h-4 mr-1" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(staffMember)}
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
                    {staff.links && staff.links.length > 3 && (
                        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing <span className="font-medium">{staff.from}</span> to{' '}
                                    <span className="font-medium">{staff.to}</span> of{' '}
                                    <span className="font-medium">{staff.total}</span> results
                                </div>
                                <div className="flex space-x-2">
                                    {staff.links.map((link, index) => (
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
