import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { IconArrowLeft, IconStar, IconStarFilled, IconSend, IconLoader2 } from '@tabler/icons-react';
import toast from 'react-hot-toast';

export default function FeedbackCreate({ auth, appointment }) {
    const { data, setData, post, processing, errors } = useForm({
        overall_rating: 0,
        service_quality: 0,
        staff_rating: 0,
        cleanliness_rating: 0,
        value_rating: 0,
        comment: '',
        improvements: '',
        would_recommend: true,
    });

    const [hoveredRating, setHoveredRating] = useState({
        overall: 0,
        service: 0,
        staff: 0,
        cleanliness: 0,
        value: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.overall_rating === 0) {
            toast.error('Please provide an overall rating');
            return;
        }

        post(route('appointments.feedback.store', appointment.id), {
            preserveScroll: true,
        });
    };

    const RatingStars = ({ name, value, onChange, label, required = false }) => {
        const displayValue = hoveredRating[name] || value;

        return (
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [name]: star }))}
                            onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [name]: 0 }))}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            {star <= displayValue ? (
                                <IconStarFilled className="w-8 h-8 text-amber-400" />
                            ) : (
                                <IconStar className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            )}
                        </button>
                    ))}
                    <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {displayValue > 0 ? `${displayValue} / 5` : 'Not rated'}
                    </span>
                </div>
                {errors[`${name}_rating`] && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors[`${name}_rating`]}</p>
                )}
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Give Feedback" />

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
                            Share Your Experience
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Your feedback helps us improve our services
                        </p>
                    </div>

                    {/* Appointment Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                                    Appointment
                                </p>
                                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    {appointment.appointment_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                                    Date
                                </p>
                                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                    {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            {appointment.staff && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                                        Staff
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        {appointment.staff.name}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                                    Services
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {appointment.services?.map(s => s.name).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Overall Rating */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Overall Experience
                            </h2>
                            <RatingStars
                                name="overall"
                                value={data.overall_rating}
                                onChange={(value) => setData('overall_rating', value)}
                                label="How would you rate your overall experience?"
                                required
                            />
                        </div>

                        {/* Detailed Ratings */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Detailed Ratings
                            </h2>
                            <div className="space-y-6">
                                <RatingStars
                                    name="service"
                                    value={data.service_quality}
                                    onChange={(value) => setData('service_quality', value)}
                                    label="Service Quality"
                                />
                                {appointment.staff && (
                                    <RatingStars
                                        name="staff"
                                        value={data.staff_rating}
                                        onChange={(value) => setData('staff_rating', value)}
                                        label="Staff Performance"
                                    />
                                )}
                                <RatingStars
                                    name="cleanliness"
                                    value={data.cleanliness_rating}
                                    onChange={(value) => setData('cleanliness_rating', value)}
                                    label="Cleanliness & Hygiene"
                                />
                                <RatingStars
                                    name="value"
                                    value={data.value_rating}
                                    onChange={(value) => setData('value_rating', value)}
                                    label="Value for Money"
                                />
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Tell Us More
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        What did you like about your experience?
                                    </label>
                                    <textarea
                                        value={data.comment}
                                        onChange={(e) => setData('comment', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Share what you enjoyed..."
                                        maxLength={1000}
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {data.comment.length} / 1000 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        What can we improve?
                                    </label>
                                    <textarea
                                        value={data.improvements}
                                        onChange={(e) => setData('improvements', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Your suggestions for improvement..."
                                        maxLength={1000}
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {data.improvements.length} / 1000 characters
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                Would You Recommend Us?
                            </h2>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('would_recommend', true)}
                                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all ${
                                        data.would_recommend
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    Yes, I would recommend
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('would_recommend', false)}
                                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all ${
                                        !data.would_recommend
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    No, not yet
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Link
                                href={route('appointments.show', appointment.id)}
                                className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || data.overall_rating === 0}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <IconLoader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <IconSend className="w-5 h-5 mr-2" />
                                        Submit Feedback
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
