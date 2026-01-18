import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    IconArrowLeft,
    IconStar,
    IconStarFilled,
    IconThumbUp,
    IconThumbDown,
    IconCalendar,
    IconUser,
    IconSparkles
} from '@tabler/icons-react';

export default function FeedbackShow({ auth, appointment, feedback }) {
    const RatingDisplay = ({ rating, label }) => {
        if (!rating) return null;

        return (
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <div key={star}>
                                {star <= rating ? (
                                    <IconStarFilled className="w-5 h-5 text-amber-400" />
                                ) : (
                                    <IconStar className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                )}
                            </div>
                        ))}
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {rating} / 5
                    </span>
                </div>
            </div>
        );
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
        if (rating >= 3.5) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getRatingBgColor = (rating) => {
        if (rating >= 4.5) return 'bg-green-100 dark:bg-green-900/30';
        if (rating >= 3.5) return 'bg-amber-100 dark:bg-amber-900/30';
        return 'bg-red-100 dark:bg-red-900/30';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Feedback Details" />

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
                            Customer Feedback
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Submitted on {new Date(feedback.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>

                    {/* Overall Rating Hero Card */}
                    <div className={`${getRatingBgColor(feedback.overall_rating)} rounded-2xl p-8 mb-6 border-2 ${
                        feedback.overall_rating >= 4.5 ? 'border-green-200 dark:border-green-800' :
                        feedback.overall_rating >= 3.5 ? 'border-amber-200 dark:border-amber-800' :
                        'border-red-200 dark:border-red-800'
                    }`}>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-900 mb-4">
                                <IconSparkles className={`w-8 h-8 ${getRatingColor(feedback.overall_rating)}`} />
                            </div>
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                                Overall Rating
                            </h2>
                            <div className="text-6xl font-bold mb-2 ${getRatingColor(feedback.overall_rating)}">
                                {feedback.overall_rating}
                            </div>
                            <div className="flex justify-center mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <IconStarFilled
                                        key={star}
                                        className={`w-6 h-6 ${star <= feedback.overall_rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {feedback.overall_rating >= 4.5 ? 'Excellent Experience' :
                                 feedback.overall_rating >= 3.5 ? 'Good Experience' :
                                 'Needs Improvement'}
                            </p>
                        </div>
                    </div>

                    {/* Appointment Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <IconCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Appointment Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Appointment Number
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {appointment.appointment_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Customer
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {appointment.customer?.name}
                                </p>
                            </div>
                            {appointment.staff && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                        Staff Member
                                    </p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {appointment.staff.name}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Date
                                </p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Ratings */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                            Detailed Ratings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {feedback.service_quality && (
                                <RatingDisplay rating={feedback.service_quality} label="Service Quality" />
                            )}
                            {feedback.staff_rating && (
                                <RatingDisplay rating={feedback.staff_rating} label="Staff Performance" />
                            )}
                            {feedback.cleanliness_rating && (
                                <RatingDisplay rating={feedback.cleanliness_rating} label="Cleanliness & Hygiene" />
                            )}
                            {feedback.value_rating && (
                                <RatingDisplay rating={feedback.value_rating} label="Value for Money" />
                            )}
                        </div>
                    </div>

                    {/* Comments */}
                    {(feedback.comment || feedback.improvements) && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Customer Comments
                            </h2>
                            <div className="space-y-6">
                                {feedback.comment && (
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            What they liked:
                                        </p>
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                {feedback.comment}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {feedback.improvements && (
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Suggestions for improvement:
                                        </p>
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                {feedback.improvements}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recommendation */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Would Recommend?
                        </h2>
                        <div className={`flex items-center gap-3 p-4 rounded-xl ${
                            feedback.would_recommend
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}>
                            {feedback.would_recommend ? (
                                <>
                                    <IconThumbUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    <div>
                                        <p className="font-bold text-green-900 dark:text-green-100">
                                            Yes, would recommend
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            This customer would recommend us to others
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <IconThumbDown className="w-8 h-8 text-red-600 dark:text-red-400" />
                                    <div>
                                        <p className="font-bold text-red-900 dark:text-red-100">
                                            Not yet
                                        </p>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            This customer needs more convincing
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
