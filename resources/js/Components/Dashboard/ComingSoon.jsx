import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { IconRocket, IconCheck } from '@tabler/icons-react';

export default function ComingSoon({ auth, title, description, features, icon: Icon }) {
    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={title || 'Coming Soon'} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        {Icon && <Icon size={32} className="text-primary-600" />}
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            {description}
                        </p>
                    )}
                </div>

                {/* Coming Soon Notice */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 rounded-xl border-2 border-primary-200 dark:border-primary-800 p-12 text-center">
                    <div className="max-w-2xl mx-auto">
                        {Icon ? (
                            <Icon size={64} className="mx-auto text-primary-600 dark:text-primary-400 mb-4" />
                        ) : (
                            <IconRocket size={64} className="mx-auto text-primary-600 dark:text-primary-400 mb-4" />
                        )}

                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                            {title}
                        </h2>

                        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
                            {description || 'This feature is currently under development and will be available soon.'}
                        </p>

                        {features && features.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Features Coming Soon:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <IconCheck size={20} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-900 dark:text-blue-200">
                                <strong>Good news!</strong> The backend infrastructure and routing are already in place.
                                Full implementation with database models, business logic, and UI is in progress.
                            </p>
                        </div>

                        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                            Check back soon for updates or contact your system administrator for more information.
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Implementation Status</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span className="text-slate-700 dark:text-slate-300">Routes & Controllers</span>
                            <span className="ml-auto text-sm text-green-600 dark:text-green-400 font-medium">Complete</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span className="text-slate-700 dark:text-slate-300">Permission System</span>
                            <span className="ml-auto text-sm text-green-600 dark:text-green-400 font-medium">Complete</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                            <span className="text-slate-700 dark:text-slate-300">Database Models</span>
                            <span className="ml-auto text-sm text-yellow-600 dark:text-yellow-400 font-medium">In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                            <span className="text-slate-700 dark:text-slate-300">Business Logic</span>
                            <span className="ml-auto text-sm text-yellow-600 dark:text-yellow-400 font-medium">In Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                            <span className="text-slate-700 dark:text-slate-300">User Interface</span>
                            <span className="ml-auto text-sm text-yellow-600 dark:text-yellow-400 font-medium">In Progress</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
