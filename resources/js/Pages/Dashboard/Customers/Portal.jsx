import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconCalendar,
    IconCalendarCheck,
    IconCalendarX,
    IconShoppingBag,
    IconCurrencyDollar,
    IconStar,
    IconStarFilled,
    IconClock,
    IconUser,
    IconMapPin,
    IconPhone,
    IconMail,
    IconSparkles,
    IconChevronRight,
} from '@tabler/icons-react';

export default function CustomerPortal({ auth, customer, upcomingAppointments, pastAppointments, stats }) {
    const StatusBadge = ({ status }) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };

        const labels = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const AppointmentCard = ({ appointment, isUpcoming = true }) => {
        const appointmentDate = new Date(appointment.appointment_date);
        const isToday = appointmentDate.toDateString() === new Date().toDateString();
        const isTomorrow = appointmentDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                #{appointment.appointment_number}
                            </span>
                            <StatusBadge status={appointment.status} />
                        </div>
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                            <IconCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold">
                                {appointmentDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            {isToday && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                                    TODAY
                                </span>
                            )}
                            {isTomorrow && (
                                <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded">
                                    TOMORROW
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <IconClock className="w-4 h-4" />
                            <span className="text-sm">
                                {appointmentDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                    <Link
                        href={route('appointments.show', appointment.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <IconChevronRight className="w-5 h-5 text-slate-400" />
                    </Link>
                </div>

                {/* Services */}
                {appointment.services && appointment.services.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Services
                        </p>
                        <div className="space-y-1">
                            {appointment.services.map((service, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {service.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Staff */}
                {appointment.staff && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Staff Member
                        </p>
                        <div className="flex items-center gap-2">
                            <IconUser className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {appointment.staff.name}
                            </span>
                        </div>
                    </div>
                )}

                {/* Feedback */}
                {appointment.status === 'completed' && appointment.feedback && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconStar className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Your Rating:
                                </span>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <IconStarFilled
                                            key={star}
                                            className={`w-4 h-4 ${
                                                star <= appointment.feedback.overall_rating
                                                    ? 'text-amber-400'
                                                    : 'text-slate-300 dark:text-slate-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <Link
                                href={route('appointments.feedback.show', appointment.id)}
                                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                View Feedback
                            </Link>
                        </div>
                    </div>
                )}

                {/* Give Feedback CTA */}
                {appointment.status === 'completed' && !appointment.feedback && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <Link
                            href={route('appointments.feedback.create', appointment.id)}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <IconStar className="w-4 h-4 mr-2" />
                            Give Feedback
                        </Link>
                    </div>
                )}
            </div>
        );
    };

    const StatCard = ({ icon: Icon, label, value, color, iconBg }) => (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${iconBg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {label}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${customer.name} - Customer Portal`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('customers.index')}
                            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
                        >
                            <IconArrowLeft className="w-4 h-4 mr-1" />
                            Back to Customers
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                    Customer Portal
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 mt-2">
                                    View appointments and activity for {customer.name}
                                </p>
                            </div>
                            <Link
                                href={route('appointments.create')}
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <IconCalendar className="w-5 h-5 mr-2" />
                                Book New Appointment
                            </Link>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                    <IconUser className="w-3 h-3" />
                                    Customer Name
                                </p>
                                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    {customer.name}
                                </p>
                            </div>
                            {customer.no_telp && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                        <IconPhone className="w-3 h-3" />
                                        Phone
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        {customer.no_telp}
                                    </p>
                                </div>
                            )}
                            {customer.email && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                        <IconMail className="w-3 h-3" />
                                        Email
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        {customer.email}
                                    </p>
                                </div>
                            )}
                            {customer.address && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                                        <IconMapPin className="w-3 h-3" />
                                        Address
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        {customer.address}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            icon={IconCalendar}
                            label="Total Appointments"
                            value={stats.total_appointments}
                            color="text-blue-600 dark:text-blue-400"
                            iconBg="bg-blue-100 dark:bg-blue-900/30"
                        />
                        <StatCard
                            icon={IconCalendarCheck}
                            label="Completed"
                            value={stats.completed_appointments}
                            color="text-green-600 dark:text-green-400"
                            iconBg="bg-green-100 dark:bg-green-900/30"
                        />
                        <StatCard
                            icon={IconShoppingBag}
                            label="Total Purchases"
                            value={stats.total_transactions}
                            color="text-purple-600 dark:text-purple-400"
                            iconBg="bg-purple-100 dark:bg-purple-900/30"
                        />
                        <StatCard
                            icon={IconCurrencyDollar}
                            label="Total Spent"
                            value={formatCurrency(stats.total_spent)}
                            color="text-emerald-600 dark:text-emerald-400"
                            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                        />
                        <StatCard
                            icon={IconCalendarX}
                            label="Cancelled"
                            value={stats.cancelled_appointments}
                            color="text-red-600 dark:text-red-400"
                            iconBg="bg-red-100 dark:bg-red-900/30"
                        />
                        {stats.avg_rating && (
                            <StatCard
                                icon={IconSparkles}
                                label="Average Rating"
                                value={`${stats.avg_rating} / 5`}
                                color="text-amber-600 dark:text-amber-400"
                                iconBg="bg-amber-100 dark:bg-amber-900/30"
                            />
                        )}
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <IconCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                Upcoming Appointments
                            </h2>
                            {upcomingAppointments.length > 0 && (
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">
                                    {upcomingAppointments.length} scheduled
                                </span>
                            )}
                        </div>

                        {upcomingAppointments.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {upcomingAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        isUpcoming={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                                <IconCalendar className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    No Upcoming Appointments
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    Book a new appointment to get started
                                </p>
                                <Link
                                    href={route('appointments.create')}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <IconCalendar className="w-5 h-5 mr-2" />
                                    Book Appointment
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Past Appointments */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <IconCalendarCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                                Past Appointments
                            </h2>
                            {pastAppointments.length > 0 && (
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-full text-sm font-semibold">
                                    Last {pastAppointments.length} appointments
                                </span>
                            )}
                        </div>

                        {pastAppointments.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {pastAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        isUpcoming={false}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                                <IconCalendarCheck className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    No Past Appointments
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Appointment history will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
