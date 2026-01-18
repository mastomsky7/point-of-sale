import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { IconPlus, IconCalendar, IconClock, IconUser, IconPhone, IconSearch, IconFilter, IconChartBar, IconStar } from '@tabler/icons-react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function AppointmentsIndex({ auth, appointments, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('appointments.index'), { search, status }, { preserveState: true, preserveScroll: true });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Appointments" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 sm:p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                                        <IconCalendar size={24} className="text-primary-600 dark:text-primary-400" />
                                    </div>
                                    Appointments
                                </h1>
                                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 ml-12 sm:ml-14">
                                    Manage customer appointments and bookings
                                </p>
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                                <Link
                                    href={route('appointments.analytics')}
                                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all shadow-sm"
                                >
                                    <IconChartBar className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                                    <span className="hidden sm:inline">Analytics</span>
                                </Link>
                                <Link
                                    href={route('appointments.feedback.analytics')}
                                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <IconStar className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                                    <span className="hidden sm:inline">Feedback</span>
                                </Link>
                                <Link
                                    href={route('appointments.create')}
                                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <IconPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    New Appointment
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6">
                        <form onSubmit={handleSearch} className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by appointment number or customer name..."
                                        className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="sm:w-48">
                                <div className="relative">
                                    <IconFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="no_show">No Show</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-6 h-11 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <IconSearch className="w-4 h-4" />
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Appointments List */}
                    <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {appointments.data.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <IconCalendar className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No appointments found</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try adjusting your filters or create a new appointment</p>
                                </div>
                            ) : (
                                appointments.data.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                        {appointment.appointment_number}
                                                    </h3>
                                                    {getStatusBadge(appointment.status)}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
                                                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                                                        <IconUser className="w-4 h-4 mr-2 flex-shrink-0" />
                                                        <span className="truncate">{appointment.customer.name}</span>
                                                    </div>
                                                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                                                        <IconCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                                        {new Date(appointment.appointment_date).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                                                        <IconClock className="w-4 h-4 mr-2 flex-shrink-0" />
                                                        {new Date(appointment.appointment_date).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })} ({appointment.duration} min)
                                                    </div>
                                                    {appointment.staff && (
                                                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                                                            <IconUser className="w-4 h-4 mr-2 flex-shrink-0" />
                                                            <span className="truncate">Staff: {appointment.staff.name}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {appointment.services && appointment.services.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        {appointment.services.map((service, idx) => (
                                                            <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-xs font-medium">
                                                                {service.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 lg:ml-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                                                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                                                        Rp {Number(appointment.total_price).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={route('appointments.show', appointment.id)}
                                                    className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    View Details →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {appointments.links && appointments.links.length > 3 && (
                            <div className="px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{appointments.from}</span> to{' '}
                                        <span className="font-semibold text-slate-900 dark:text-slate-100">{appointments.to}</span> of{' '}
                                        <span className="font-semibold text-slate-900 dark:text-slate-100">{appointments.total}</span> results
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {appointments.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveScroll
                                                className={`min-w-[2.5rem] h-10 px-3 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                                    link.active
                                                        ? 'bg-primary-600 text-white shadow-sm'
                                                        : link.url
                                                        ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
