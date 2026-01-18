import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    IconCalendar,
    IconClock,
    IconUser,
    IconCurrencyDollar,
    IconArrowLeft,
    IconCheck,
    IconLoader2,
    IconNotes,
    IconBriefcase
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function AppointmentEdit({ auth, appointment, customers, services, staff }) {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: appointment.customer_id || '',
        staff_id: appointment.staff_id || '',
        services: appointment.appointmentServices ? appointment.appointmentServices.map(as => ({ id: as.service_id, staff_id: as.staff_id })) : [],
        appointment_date: appointment.appointment_date ? new Date(appointment.appointment_date).toISOString().split('T')[0] : '',
        appointment_time: appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
        status: appointment.status || 'pending',
        deposit: appointment.deposit || 0,
        notes: appointment.notes || '',
    });

    const [selectedServices, setSelectedServices] = useState(
        appointment.appointmentServices ? appointment.appointmentServices.map(as => as.service_id.toString()) : []
    );
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
        const categoryName = service.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(service);
        return acc;
    }, {});

    // Calculate total when services change
    useEffect(() => {
        const total = selectedServices.reduce((sum, serviceId) => {
            const service = services.find(s => s.id === parseInt(serviceId));
            return sum + (service ? parseFloat(service.price) : 0);
        }, 0);

        const duration = selectedServices.reduce((sum, serviceId) => {
            const service = services.find(s => s.id === parseInt(serviceId));
            return sum + (service ? parseInt(service.duration) : 0);
        }, 0);

        setTotalPrice(total);
        setTotalDuration(duration);
        setData('services', selectedServices.map(id => ({ id: parseInt(id) })));
    }, [selectedServices]);

    // Fetch available time slots when date and staff selected
    useEffect(() => {
        if (data.appointment_date && data.staff_id) {
            setLoadingSlots(true);
            fetch(route('appointments.availableSlots') + `?date=${data.appointment_date}&staff_id=${data.staff_id}&duration=${totalDuration || 30}`)
                .then(res => res.json())
                .then(slots => {
                    // Include current appointment time if not in available slots
                    if (data.appointment_time && !slots.includes(data.appointment_time)) {
                        slots.push(data.appointment_time);
                        slots.sort();
                    }
                    setAvailableSlots(slots);
                    setLoadingSlots(false);
                })
                .catch(() => {
                    setAvailableSlots([]);
                    setLoadingSlots(false);
                    toast.error('Failed to load available time slots');
                });
        }
    }, [data.appointment_date, data.staff_id, totalDuration]);

    const handleServiceToggle = (serviceId) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedServices.length === 0) {
            toast.error('Please select at least one service');
            return;
        }

        if (!data.appointment_time) {
            toast.error('Please select appointment time');
            return;
        }

        // Combine date and time
        const datetime = `${data.appointment_date} ${data.appointment_time}:00`;

        put(route('appointments.update', appointment.id), {
            ...data,
            appointment_date: datetime,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Appointment ${appointment.appointment_number}`} />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <Link
                                href={route('appointments.show', appointment.id)}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <IconArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 sm:p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                                        <IconCalendar size={24} className="text-primary-600 dark:text-primary-400" />
                                    </div>
                                    Edit Appointment
                                </h1>
                                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 ml-12 sm:ml-14">
                                    {appointment.appointment_number}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Customer Selection */}
                        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <IconUser className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                Customer Information
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Select Customer *
                                </label>
                                <select
                                    value={data.customer_id}
                                    onChange={e => setData('customer_id', e.target.value)}
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    required
                                >
                                    <option value="">Select a customer...</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} - {customer.no_telp}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customer_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Services Selection */}
                        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <IconBriefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                Select Services *
                            </h3>

                            <div className="space-y-6">
                                {Object.entries(servicesByCategory).map(([categoryName, categoryServices]) => (
                                    <div key={categoryName}>
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                                            {categoryName}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {categoryServices.map(service => (
                                                <div
                                                    key={service.id}
                                                    onClick={() => handleServiceToggle(service.id.toString())}
                                                    className={`relative p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                                        selectedServices.includes(service.id.toString())
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                                                    }`}
                                                >
                                                    {selectedServices.includes(service.id.toString()) && (
                                                        <div className="absolute top-3 right-3">
                                                            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                                                                <IconCheck className="w-4 h-4 text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="pr-8">
                                                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                                                            {service.name}
                                                        </h4>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                            <span className="flex items-center gap-1">
                                                                <IconClock className="w-3.5 h-3.5" />
                                                                {service.duration} min
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                                            Rp {Number(service.price).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                    {service.description && (
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                                                            {service.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {errors.services && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.services}</p>
                            )}

                            {/* Summary */}
                            {selectedServices.length > 0 && (
                                <div className="mt-6 p-4 sm:p-5 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border border-primary-200 dark:border-primary-800">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                                                {selectedServices.length} service(s) selected
                                            </p>
                                            <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1">
                                                <IconClock className="w-3.5 h-3.5" />
                                                Total Duration: {totalDuration} minutes
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Total Price</p>
                                            <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                                                Rp {totalPrice.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Schedule */}
                        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <IconCalendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                Schedule
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {/* Staff */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Select Staff *
                                    </label>
                                    <select
                                        value={data.staff_id}
                                        onChange={e => setData('staff_id', e.target.value)}
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        required
                                    >
                                        <option value="">Select staff...</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} {s.specialization ? `- ${s.specialization}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.staff_id && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.staff_id}</p>
                                    )}
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Appointment Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.appointment_date}
                                        onChange={e => setData('appointment_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        required
                                    />
                                    {errors.appointment_date && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.appointment_date}</p>
                                    )}
                                </div>

                                {/* Time Slots */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                        <IconClock className="w-4 h-4" />
                                        Appointment Time *
                                    </label>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center py-8">
                                            <IconLoader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                                            {availableSlots.map(slot => (
                                                <button
                                                    key={slot}
                                                    type="button"
                                                    onClick={() => setData('appointment_time', slot)}
                                                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                                        data.appointment_time === slot
                                                            ? 'bg-primary-600 text-white shadow-sm'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <IconClock className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                Select date and staff to see available time slots
                                            </p>
                                        </div>
                                    )}
                                    {errors.appointment_time && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.appointment_time}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status & Additional Information */}
                        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <IconNotes className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                Additional Information
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="no_show">No Show</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                                    )}
                                </div>

                                {/* Deposit */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                                        <IconCurrencyDollar className="w-4 h-4" />
                                        Deposit Amount (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.deposit}
                                        onChange={e => setData('deposit', e.target.value)}
                                        min="0"
                                        max={totalPrice}
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        placeholder="0"
                                    />
                                    {errors.deposit && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deposit}</p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        rows="3"
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                                        placeholder="Any special requests or notes..."
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Submit Bar */}
                        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 -mx-3 sm:-mx-4 lg:-mx-6">
                            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 sm:justify-end">
                                <Link
                                    href={route('appointments.show', appointment.id)}
                                    className="w-full sm:w-auto px-6 h-11 flex items-center justify-center rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || selectedServices.length === 0 || !data.appointment_time}
                                    className="w-full sm:w-auto px-6 h-11 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <IconLoader2 className="w-5 h-5 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <IconCheck className="w-5 h-5" />
                                            Update Appointment
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
