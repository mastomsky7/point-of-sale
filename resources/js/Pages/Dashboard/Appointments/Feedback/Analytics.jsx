import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    IconArrowLeft,
    IconStar,
    IconStarFilled,
    IconTrendingUp,
    IconTrendingDown,
    IconUsers,
    IconThumbUp,
    IconDownload,
    IconCalendar,
    IconSparkles,
    IconFilter
} from '@tabler/icons-react';

export default function FeedbackAnalytics({ auth, stats, ratingDistribution, staffRatings, recentFeedbacks, dateRange }) {
    const [startDate, setStartDate] = useState(dateRange?.start || '');
    const [endDate, setEndDate] = useState(dateRange?.end || '');

    const handleFilterChange = (e) => {
        e.preventDefault();
        router.get(route('appointments.feedback.analytics'), { start_date: startDate, end_date: endDate }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        window.open(route('appointments.feedback.analytics') + `?start_date=${startDate}&end_date=${endDate}&export=csv`, '_blank');
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
        if (rating >= 3.5) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getRatingBgColor = (rating) => {
        if (rating >= 4.5) return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
        if (rating >= 3.5) return 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
        return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
    };

    const getProgressColor = (rating) => {
        if (rating >= 4.5) return 'bg-green-600';
        if (rating >= 3.5) return 'bg-amber-600';
        return 'bg-red-600';
    };

    const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
        <div className={`${color} rounded-2xl p-6 border-2`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${color.includes('green') ? 'bg-green-600' : color.includes('amber') ? 'bg-amber-600' : color.includes('blue') ? 'bg-blue-600' : 'bg-purple-600'}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trend > 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                        {trend > 0 ? (
                            <IconTrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                            <IconTrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                        <span className={`text-xs font-bold ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {Math.abs(trend)}%
                        </span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {title}
                </p>
                <p className={`text-3xl font-bold ${color.includes('green') ? 'text-green-900 dark:text-green-100' : color.includes('amber') ? 'text-amber-900 dark:text-amber-100' : color.includes('blue') ? 'text-blue-900 dark:text-blue-100' : 'text-purple-900 dark:text-purple-100'}`}>
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );

    const RatingBar = ({ rating, count, total }) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{rating}</span>
                    <IconStarFilled className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getProgressColor(rating)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-12 text-right">
                    {count}
                </span>
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Feedback Analytics" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('appointments.index')}
                            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
                        >
                            <IconArrowLeft className="w-4 h-4 mr-1" />
                            Back to Appointments
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <IconSparkles className="w-8 h-8 text-amber-500" />
                                    Feedback Analytics
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 mt-2">
                                    Customer satisfaction insights and trends
                                </p>
                            </div>
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg"
                            >
                                <IconDownload className="w-4 h-4 mr-2" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6">
                        <form onSubmit={handleFilterChange} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-6 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    <IconFilter className="w-4 h-4" />
                                    Apply Filter
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Overview Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <MetricCard
                            title="Overall Rating"
                            value={stats.avg_overall.toFixed(1)}
                            icon={IconStar}
                            color={getRatingBgColor(stats.avg_overall)}
                            subtitle="Average rating"
                        />
                        <MetricCard
                            title="Total Feedbacks"
                            value={stats.total_feedbacks}
                            icon={IconUsers}
                            color="bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                            subtitle="Responses received"
                        />
                        <MetricCard
                            title="Recommendation"
                            value={`${stats.recommendation_rate}%`}
                            icon={IconThumbUp}
                            color="bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800"
                            subtitle="Would recommend"
                        />
                        <MetricCard
                            title="Service Quality"
                            value={stats.avg_service.toFixed(1)}
                            icon={IconSparkles}
                            color={getRatingBgColor(stats.avg_service)}
                            subtitle="Service rating"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Rating Distribution */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Rating Distribution
                            </h2>
                            <div className="space-y-4">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const ratingData = ratingDistribution.find(r => r.overall_rating === rating);
                                    const count = ratingData?.count || 0;
                                    return (
                                        <RatingBar
                                            key={rating}
                                            rating={rating}
                                            count={count}
                                            total={stats.total_feedbacks}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detailed Ratings */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Category Breakdown
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Service Quality', value: stats.avg_service },
                                    { label: 'Staff Performance', value: stats.avg_staff },
                                    { label: 'Cleanliness', value: stats.avg_cleanliness },
                                    { label: 'Value for Money', value: stats.avg_value }
                                ].map((category) => (
                                    <div key={category.label}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {category.label}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${getRatingColor(category.value)}`}>
                                                    {category.value.toFixed(1)}
                                                </span>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        star <= Math.round(category.value) ? (
                                                            <IconStarFilled key={star} className="w-4 h-4 text-amber-400" />
                                                        ) : (
                                                            <IconStar key={star} className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getProgressColor(category.value)} transition-all duration-500`}
                                                style={{ width: `${(category.value / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Staff Performance */}
                    {staffRatings.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Staff Performance
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Staff Member
                                            </th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Feedbacks
                                            </th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Staff Rating
                                            </th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                                                Overall Rating
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {staffRatings.map((staff) => (
                                            <tr key={staff.staff_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="py-4 px-4">
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {staff.staff?.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold">
                                                        {staff.feedback_count}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className={`text-sm font-bold ${getRatingColor(staff.avg_rating || 0)}`}>
                                                            {(staff.avg_rating || 0).toFixed(1)}
                                                        </span>
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                star <= Math.round(staff.avg_rating || 0) ? (
                                                                    <IconStarFilled key={star} className="w-4 h-4 text-amber-400" />
                                                                ) : (
                                                                    <IconStar key={star} className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                                                )
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className={`text-sm font-bold ${getRatingColor(staff.avg_overall || 0)}`}>
                                                            {(staff.avg_overall || 0).toFixed(1)}
                                                        </span>
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                star <= Math.round(staff.avg_overall || 0) ? (
                                                                    <IconStarFilled key={star} className="w-4 h-4 text-amber-400" />
                                                                ) : (
                                                                    <IconStar key={star} className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                                                )
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Recent Feedbacks */}
                    {recentFeedbacks.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                Recent Feedback
                            </h2>
                            <div className="space-y-4">
                                {recentFeedbacks.map((feedback) => (
                                    <div
                                        key={feedback.id}
                                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {feedback.customer?.name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {feedback.appointment?.appointment_number} • {new Date(feedback.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className={`text-lg font-bold ${getRatingColor(feedback.overall_rating)}`}>
                                                    {feedback.overall_rating}
                                                </span>
                                                <IconStarFilled className="w-5 h-5 text-amber-400" />
                                            </div>
                                        </div>
                                        {feedback.comment && (
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                                "{feedback.comment}"
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {feedback.would_recommend ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                                                    <IconThumbUp className="w-3 h-3" />
                                                    Would recommend
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold">
                                                    Not recommended
                                                </span>
                                            )}
                                            {feedback.staff && (
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    Staff: {feedback.staff.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Data State */}
                    {stats.total_feedbacks === 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                            <IconSparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                No Feedback Yet
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                No feedback has been submitted for the selected date range.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
