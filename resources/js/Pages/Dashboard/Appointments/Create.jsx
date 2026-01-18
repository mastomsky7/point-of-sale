import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import {
    IconCalendar,
    IconClock,
    IconUser,
    IconCurrencyDollar,
    IconArrowLeft,
    IconCheck,
    IconLoader2,
    IconNotes,
    IconSparkles
} from '@tabler/icons-react';

export default function AppointmentCreate({ auth, customers, services, staff, customer = null, prefilledServices = [], fromTransaction = false, transactionInvoice = null }) {
    const { errors: pageErrors } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        customer_id: customer?.id || '',
        staff_id: prefilledServices[0]?.staff_id || '',
        services: [],
        appointment_date: '',
        appointment_time: '',
        deposit: 0,
        notes: fromTransaction ? `Rebook from transaction ${transactionInvoice}` : '',
    });

    const [selectedServices, setSelectedServices] = useState(prefilledServices.map(s => s.id.toString()) || []);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // D3: Show info toast if coming from transaction
    useEffect(() => {
        if (fromTransaction) {
            toast.success(`Services pre-filled from transaction ${transactionInvoice}. Select date and time to continue.`, {
                duration: 5000,
            });
        }
    }, [fromTransaction]);

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
                    setAvailableSlots(slots);
                    setLoadingSlots(false);
                })
                .catch(() => {
                    setAvailableSlots([]);
                    setLoadingSlots(false);
                    toast.error('Failed to load available time slots');
                });
        } else {
            setAvailableSlots([]);
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

        post(route('appointments.store'), {
            ...data,
            appointment_date: datetime,
        });
    };

    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
        const categoryName = service.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = [];
        }
        acc[categoryName].push(service);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Appointment" />

            <div className="py-4 sm:py-6">
                <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Link
                                href={route('appointments.index')}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <IconArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
                            </Link>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                    Create New Appointment
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Fill in the details to book a new appointment
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Customer Selection */}
                        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <IconUser className="w-4 h-4 text-primary-600 dark:text-primary-400" />
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
                                    className="w-full px-4 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    required
                                >
                                    <option value="">Choose a customer...</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} - {customer.no_telp}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.customer_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Services Selection */}
                        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <IconSparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                Select Services *
                            </h3>

                            <div className="space-y-6">
                                {Object.entries(servicesByCategory).map(([categoryName, categoryServices]) => (
                                    <div key={categoryName}>
                                        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
                                            {categoryName}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {categoryServices.map(service => (
                                                <div
                                                    key={service.id}
                                                    onClick={() => handleServiceToggle(service.id.toString())}
                                                    className={`relative p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                                        selectedServices.includes(service.id.toString())
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-slate-800'
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
                                                        <h4 className="font-semibold text-slate-900 dark:text-white">
                                                            {service.name}
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <IconClock className="w-3.5 h-3.5" />
                                                                {service.duration} min
                                                            </span>
                                                            <span>•</span>
                                                            <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                                Rp {Number(service.price).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        {service.description && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                                                                {service.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {errors.services && (
                                <p className="mt-3 text-sm text-red-600 dark:text-red-400">{errors.services}</p>
                            )}

                            {/* Summary */}
                            {selectedServices.length > 0 && (
                                <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {selectedServices.length} service(s) selected
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                Total Duration: <span className="font-semibold text-slate-900 dark:text-white">{totalDuration} minutes</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Price</p>
                                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                                Rp {totalPrice.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Staff & Date/Time Selection */}
                        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <IconCalendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                Schedule
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Staff */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Select Staff *
                                    </label>
                                    <select
                                        value={data.staff_id}
                                        onChange={e => setData('staff_id', e.target.value)}
                                        className="w-full px-4 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        required
                                    >
                                        <option value="">Choose staff...</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}{s.specialization ? ` - ${s.specialization}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.staff_id && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.staff_id}</p>
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
                                        className="w-full px-4 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        required
                                    />
                                    {errors.appointment_date && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.appointment_date}</p>
                                    )}
                                </div>

                                {/* Time Slots */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Appointment Time *
                                    </label>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400">
                                            <IconLoader2 className="w-6 h-6 animate-spin mr-2" />
                                            Loading available time slots...
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
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 border border-slate-200 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    ) : data.appointment_date && data.staff_id ? (
                                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                            <IconClock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No available time slots for this date</p>
                                            <p className="text-sm mt-1">Please try another date or staff member</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                            Please select date and staff to see available time slots
                                        </p>
                                    )}
                                    {errors.appointment_time && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.appointment_time}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <IconNotes className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                Additional Information
                            </h3>

                            <div className="space-y-6">
                                {/* Deposit */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Deposit Amount (Optional)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
                                            Rp
                                        </div>
                                        <input
                                            type="number"
                                            value={data.deposit}
                                            onChange={e => setData('deposit', e.target.value)}
                                            min="0"
                                            max={totalPrice}
                                            className="w-full pl-12 pr-4 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                    {totalPrice > 0 && (
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                            Maximum deposit: Rp {totalPrice.toLocaleString('id-ID')}
                                        </p>
                                    )}
                                    {errors.deposit && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.deposit}</p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        placeholder="Any special requests or notes..."
                                    />
                                    {errors.notes && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 -mx-3 sm:-mx-4 lg:-mx-6">
                            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-end gap-3">
                                <Link
                                    href={route('appointments.index')}
                                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || selectedServices.length === 0 || !data.appointment_time}
                                    className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <IconLoader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Creating Appointment...
                                        </>
                                    ) : (
                                        <>
                                            <IconCheck className="w-5 h-5 mr-2" />
                                            Create Appointment
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
