import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconArrowLeft, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';

export default function StaffCreate({ auth, users }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        specialization: '',
        phone: '',
        email: '',
        user_id: '',
        commission_rate: 0,
        is_active: true,
        working_hours: {
            start: '09:00',
            end: '17:00'
        },
        day_off: [],
        photo: null,
    });

    const [photoPreview, setPhotoPreview] = useState(null);

    const daysOfWeek = [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' },
    ];

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDayOffToggle = (day) => {
        const newDayOff = data.day_off.includes(day)
            ? data.day_off.filter(d => d !== day)
            : [...data.day_off, day];
        setData('day_off', newDayOff);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('staff.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Add Staff Member" />

            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('staff.index')}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                <IconArrowLeft className="w-6 h-6" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Add New Staff Member
                            </h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Basic Information
                            </h3>

                            <div className="space-y-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="John Doe"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                    )}
                                </div>

                                {/* Specialization */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Specialization *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.specialization}
                                        onChange={e => setData('specialization', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="e.g., Hair Stylist, Nail Technician, Massage Therapist"
                                        required
                                    />
                                    {errors.specialization && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.specialization}</p>
                                    )}
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="+62812345678"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Link to User Account */}
                                {users && users.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Link to User Account (Optional)
                                        </label>
                                        <select
                                            value={data.user_id}
                                            onChange={e => setData('user_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">None</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.user_id && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.user_id}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Working Schedule */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Working Schedule
                            </h3>

                            <div className="space-y-4">
                                {/* Working Hours */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            value={data.working_hours.start}
                                            onChange={e => setData('working_hours', { ...data.working_hours, start: e.target.value })}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            value={data.working_hours.end}
                                            onChange={e => setData('working_hours', { ...data.working_hours, end: e.target.value })}
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Days Off */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Days Off
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {daysOfWeek.map(day => (
                                            <label
                                                key={day.value}
                                                className={`flex items-center justify-center px-4 py-2 border-2 rounded-md cursor-pointer transition-colors ${
                                                    data.day_off.includes(day.value)
                                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={data.day_off.includes(day.value)}
                                                    onChange={() => handleDayOffToggle(day.value)}
                                                    className="sr-only"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {day.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Commission & Status */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Commission & Status
                            </h3>

                            <div className="space-y-4">
                                {/* Commission Rate */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Commission Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.commission_rate}
                                        onChange={e => setData('commission_rate', e.target.value)}
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="10"
                                    />
                                    {errors.commission_rate && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.commission_rate}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Default commission rate for this staff member
                                    </p>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Staff member is currently active
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Photo Upload */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Profile Photo
                            </h3>

                            <div className="space-y-4">
                                {/* Photo Preview */}
                                {photoPreview && (
                                    <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-900 mx-auto">
                                        <img
                                            src={photoPreview}
                                            alt="Staff photo preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div>
                                    <label className="block">
                                        <span className="sr-only">Choose photo</span>
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
                                                    onChange={handlePhotoChange}
                                                />
                                            </label>
                                        </div>
                                    </label>
                                    {errors.photo && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.photo}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-4">
                            <Link
                                href={route('staff.index')}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Creating...' : 'Create Staff Member'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
