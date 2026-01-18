import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    IconArrowLeft,
    IconCalendar,
    IconClock,
    IconUser,
    IconDeviceFloppy,
    IconLoader2,
    IconAlertCircle,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function AppointmentReschedule({ auth, appointment, staff, services }) {
    const { data, setData, post, processing, errors } = useForm({
        appointment_date: appointment.appointment_date.split(' ')[0],
        appointment_time: appointment.appointment_date.split(' ')[1].substring(0, 5),
        staff_id: appointment.staff_id || '',
        reschedule_reason: '',
    });

    const [availableSlots, setAvailableSlots] = useState([]);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Generate time slots (9 AM to 8 PM, 30-minute intervals)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 20; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                if (hour === 20 && minute > 0) break; // Stop at 8:00 PM
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.appointment_date || !data.appointment_time) {
            toast.error('Please select a date and time');
            return;
        }

        post(route('appointments.process-reschedule', appointment.id), {
            preserveScroll: true,
        });
    };

    const handleTimeChange = (time) => {
        setData('appointment_time', time);
        setSelectedSlot(time);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reschedule Appointment" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('appointments.show', appointment.id)}
                            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
                        >
                            <IconArrowLeft className="w-4 h-4 mr-1" />
                            Back to Appointment
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Reschedule Appointment
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Choose a new date and time for appointment #{appointment.appointment_number}
                        </p>
                    </div>

                    {/* Current Appointment Info */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 mb-6 border border-amber-200 dark:border-amber-800">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
                            Current Appointment
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Customer
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {appointment.customer?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Current Date & Time
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                    {' at '}
                                    {new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {appointment.staff && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Staff Member
                                    </p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {appointment.staff.name}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                    Services
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {appointment.services?.map(s => s.name).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reschedule Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Date Selection */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Select New Date & Time
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        New Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <IconCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="date"
                                            value={data.appointment_date}
                                            onChange={(e) => setData('appointment_date', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            required
                                        />
                                    </div>
                                    {errors.appointment_date && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                            {errors.appointment_date}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        New Time <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => handleTimeChange(slot)}
                                                className={`px-3 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
                                                    data.appointment_time === slot
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.appointment_time && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                            {errors.appointment_time}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Staff Selection */}
                        {staff && staff.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                    Staff Member (Optional)
                                </h2>
                                <div className="relative">
                                    <IconUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        value={data.staff_id}
                                        onChange={(e) => setData('staff_id', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    >
                                        <option value="">No preference</option>
                                        {staff.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.staff_id && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        {errors.staff_id}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Reason for Rescheduling */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                Reason for Rescheduling (Optional)
                            </h2>
                            <textarea
                                value={data.reschedule_reason}
                                onChange={(e) => setData('reschedule_reason', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Let us know why you need to reschedule (optional)..."
                                maxLength={500}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {data.reschedule_reason.length} / 500 characters
                            </p>
                        </div>

                        {/* Important Notice */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                            <div className="flex gap-3">
                                <IconAlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">
                                        Important Information
                                    </h3>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                        <li>• Your appointment will be updated to the new date and time</li>
                                        <li>• You will receive a WhatsApp confirmation if notifications are enabled</li>
                                        <li>• Please arrive 10 minutes early for your appointment</li>
                                        <li>• Contact us if you need to cancel or reschedule again</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-4">
                            <Link
                                href={route('appointments.show', appointment.id)}
                                className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <IconLoader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Rescheduling...
                                    </>
                                ) : (
                                    <>
                                        <IconDeviceFloppy className="w-5 h-5 mr-2" />
                                        Confirm Reschedule
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
