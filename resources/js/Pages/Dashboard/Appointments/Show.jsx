import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { confirmDelete } from '@/Utils/SweetAlertHelper';
import {
    IconArrowLeft,
    IconCalendar,
    IconCalendarEvent,
    IconClock,
    IconUser,
    IconPhone,
    IconMail,
    IconCurrencyDollar,
    IconCheck,
    IconX,
    IconEdit,
    IconTrash,
    IconBrandWhatsapp,
    IconAlertCircle,
    IconMapPin,
    IconNotes,
    IconHistory,
    IconLoader2,
    IconShoppingCart,
    IconStar
} from '@tabler/icons-react';
import TransactionBadge from '@/Components/Appointments/TransactionBadge';

export default function AppointmentShow({ auth, appointment }) {
    const { flash } = usePage().props;
    const [isConfirming, setIsConfirming] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
            confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800',
            in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
            completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
            no_show: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${styles[status] || styles.pending}`}>
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const handleConfirm = () => {
        setIsConfirming(true);
        router.post(route('appointments.confirm', appointment.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsConfirming(false)
        });
    };

    const handleCancel = () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        setIsCancelling(true);
        router.post(route('appointments.cancel', appointment.id), {
            cancellation_reason: cancelReason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCancelModal(false);
                setCancelReason('');
            },
            onFinish: () => setIsCancelling(false)
        });
    };

    const handleComplete = () => {
        setIsCompleting(true);
        router.post(route('appointments.complete', appointment.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsCompleting(false)
        });
    };

    const handleDelete = async () => {
        const confirmed = await confirmDelete(`appointment ${appointment.appointment_number}`);
        if (confirmed) {
            setIsDeleting(true);
            router.delete(route('appointments.destroy', appointment.id), {
                onFinish: () => setIsDeleting(false)
            });
        }
    };

    const handleResendWhatsApp = () => {
        setIsResending(true);
        router.post(route('appointments.resendWhatsApp', appointment.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsResending(false)
        });
    };

    const handleConvertToPOS = () => {
        // Navigate to POS with appointment data
        router.get(route('transactions.index'), {
            appointment_id: appointment.id,
            customer_id: appointment.customer_id,
            from_appointment: true
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Appointment ${appointment.appointment_number}`} />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <Link
                                    href={route('appointments.index')}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <IconArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
                                </Link>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                        {appointment.appointment_number}
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Created {new Date(appointment.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {getStatusBadge(appointment.status)}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6">
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {appointment.status === 'pending' && (
                                <>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={isConfirming}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        {isConfirming ? (
                                            <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
                                        ) : (
                                            <><IconCheck className="w-4 h-4 mr-2" /> Confirm</>
                                        )}
                                    </button>
                                    <Link
                                        href={route('appointments.reschedule', appointment.id)}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        <IconCalendarEvent className="w-4 h-4 mr-2" /> Reschedule
                                    </Link>
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        disabled={isCancelling}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        <IconX className="w-4 h-4 mr-2" /> Cancel
                                    </button>
                                </>
                            )}

                            {appointment.status === 'confirmed' && (
                                <>
                                    <button
                                        onClick={handleComplete}
                                        disabled={isCompleting}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        {isCompleting ? (
                                            <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> Completing...</>
                                        ) : (
                                            <><IconCheck className="w-4 h-4 mr-2" /> Mark as Complete</>
                                        )}
                                    </button>
                                    <Link
                                        href={route('appointments.reschedule', appointment.id)}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        <IconCalendarEvent className="w-4 h-4 mr-2" /> Reschedule
                                    </Link>
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        disabled={isCancelling}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        <IconX className="w-4 h-4 mr-2" /> Cancel
                                    </button>
                                </>
                            )}

                            {appointment.status === 'in_progress' && (
                                <>
                                    <button
                                        onClick={handleConvertToPOS}
                                        disabled={appointment.transaction}
                                        className={`inline-flex items-center justify-center px-4 py-2 ${
                                            appointment.transaction
                                                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                        } text-white rounded-lg font-medium text-sm transition-all`}
                                        title={appointment.transaction ? 'Already converted to transaction' : 'Convert to POS'}
                                    >
                                        <IconShoppingCart className="w-4 h-4 mr-2" />
                                        {appointment.transaction ? 'Already Converted' : 'Convert to POS'}
                                    </button>
                                    <button
                                        onClick={handleComplete}
                                        disabled={isCompleting}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        {isCompleting ? (
                                            <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> Completing...</>
                                        ) : (
                                            <><IconCheck className="w-4 h-4 mr-2" /> Mark as Complete</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        disabled={isCancelling}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                    >
                                        <IconX className="w-4 h-4 mr-2" /> Cancel
                                    </button>
                                </>
                            )}

                            {['pending', 'confirmed'].includes(appointment.status) && (
                                <Link
                                    href={route('appointments.edit', appointment.id)}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                >
                                    <IconEdit className="w-4 h-4 mr-2" /> Edit
                                </Link>
                            )}

                            {appointment.status === 'completed' && !appointment.feedback && (
                                <Link
                                    href={route('appointments.feedback.create', appointment.id)}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <IconStar className="w-4 h-4 mr-2" /> Give Feedback
                                </Link>
                            )}

                            {appointment.status === 'completed' && appointment.feedback && (
                                <Link
                                    href={route('appointments.feedback.show', appointment.id)}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                >
                                    <IconStar className="w-4 h-4 mr-2" /> View Feedback
                                </Link>
                            )}

                            <button
                                onClick={handleResendWhatsApp}
                                disabled={isResending}
                                className="inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                            >
                                {isResending ? (
                                    <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                                ) : (
                                    <><IconBrandWhatsapp className="w-4 h-4 mr-2" /> Resend WhatsApp</>
                                )}
                            </button>

                            {['pending', 'cancelled'].includes(appointment.status) && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                                >
                                    {isDeleting ? (
                                        <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                                    ) : (
                                        <><IconTrash className="w-4 h-4 mr-2" /> Delete</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                        <IconUser className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    Customer Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Name</p>
                                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                                            {appointment.customer.name}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                                                <IconPhone className="w-3.5 h-3.5" />
                                                Phone
                                            </p>
                                            <p className="text-base font-medium text-slate-900 dark:text-white">
                                                {appointment.customer.no_telp}
                                            </p>
                                        </div>
                                        {appointment.customer.email && (
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                                                    <IconMail className="w-3.5 h-3.5" />
                                                    Email
                                                </p>
                                                <p className="text-base font-medium text-slate-900 dark:text-white truncate">
                                                    {appointment.customer.email}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Services */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Services Booked
                                </h3>

                                <div className="space-y-3">
                                    {appointment.services && appointment.services.map((service, index) => (
                                        <div key={index} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {service.name}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <IconClock className="w-3.5 h-3.5" />
                                                        {service.pivot?.duration || service.duration} min
                                                    </span>
                                                    {service.pivot?.staff_id && (
                                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                                            • {appointment.staff?.name || 'Staff'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="font-bold text-slate-900 dark:text-white">
                                                    Rp {Number(service.pivot?.price || service.price).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-semibold text-slate-900 dark:text-white">Total</span>
                                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                            Rp {Number(appointment.total_price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {appointment.notes && (
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                            <IconNotes className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        Notes
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                        {appointment.notes}
                                    </p>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <IconHistory className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Timeline
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Created</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(appointment.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {appointment.confirmed_at && (
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Confirmed</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(appointment.confirmed_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {appointment.completed_at && (
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Completed</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(appointment.completed_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {appointment.cancelled_at && (
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Cancelled</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(appointment.cancelled_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                {appointment.cancellation_reason && (
                                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                        Reason: {appointment.cancellation_reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Schedule */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <IconCalendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    Schedule
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Date</p>
                                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                                            {new Date(appointment.appointment_date).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                                            <IconClock className="w-3.5 h-3.5" />
                                            Time
                                        </p>
                                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                                            {new Date(appointment.appointment_date).toLocaleTimeString('id-ID', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Duration</p>
                                        <p className="text-base font-semibold text-slate-900 dark:text-white">
                                            {appointment.duration} minutes
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Badge */}
                            <TransactionBadge transaction={appointment.transaction} />

                            {/* Staff */}
                            {appointment.staff && (
                                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                            <IconUser className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        Assigned Staff
                                    </h3>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                        {appointment.staff.name}
                                    </p>
                                    {appointment.staff.specialization && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {appointment.staff.specialization}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 shadow-sm rounded-xl sm:rounded-2xl border border-primary-200 dark:border-primary-800 p-4 sm:p-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                                        <IconCurrencyDollar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    Payment Details
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            Rp {Number(appointment.total_price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {appointment.deposit > 0 && (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 dark:text-slate-400">Deposit Paid</span>
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    - Rp {Number(appointment.deposit).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-primary-200 dark:border-primary-800">
                                                <span className="font-bold text-slate-900 dark:text-white">Remaining</span>
                                                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                                    Rp {Number(appointment.total_price - appointment.deposit).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-800">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Payment Status</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                appointment.payment_status === 'paid'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : appointment.payment_status === 'deposit_paid'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                                {appointment.payment_status === 'paid' ? 'Paid' : appointment.payment_status === 'deposit_paid' ? 'Deposit Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp Status */}
                            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <IconBrandWhatsapp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    WhatsApp Notification
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        appointment.whatsapp_sent
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                        {appointment.whatsapp_sent ? 'Sent' : 'Not Sent'}
                                    </span>
                                </div>
                                {appointment.whatsapp_sent_at && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                        Last sent: {new Date(appointment.whatsapp_sent_at).toLocaleString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <IconAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Appointment</h3>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Please provide a reason for cancelling this appointment. The customer will be notified.
                        </p>

                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                            rows="4"
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all mb-4"
                            required
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling || !cancelReason.trim()}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {isCancelling ? (
                                    <><IconLoader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                                ) : (
                                    'Confirm Cancel'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
