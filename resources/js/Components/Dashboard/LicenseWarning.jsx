import { usePage } from '@inertiajs/react';
import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function LicenseWarning() {
    const { props } = usePage();
    const { license_in_grace_period, license_expiring_soon, license_days_remaining, license_expired } = props;

    // Don't show anything if no license warning
    if (!license_in_grace_period && !license_expiring_soon && !license_expired) {
        return null;
    }

    // License expired (critical)
    if (license_expired) {
        return (
            <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">License Expired</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>
                                Your store license has expired. Please contact support or renew your subscription to continue using the POS system.
                            </p>
                        </div>
                        <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                                <button
                                    type="button"
                                    className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                                    onClick={() => window.location.href = '/contact-support'}
                                >
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // License in grace period (warning)
    if (license_in_grace_period) {
        return (
            <div className="rounded-md bg-yellow-50 p-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">License Grace Period</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>
                                Your license has expired but you're in a {license_days_remaining}-day grace period.
                                Please renew your subscription to avoid service interruption.
                            </p>
                        </div>
                        <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                                <button
                                    type="button"
                                    className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                                    onClick={() => window.location.href = '/renew-license'}
                                >
                                    Renew Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // License expiring soon (info)
    if (license_expiring_soon) {
        return (
            <div className="rounded-md bg-blue-50 p-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">License Expiring Soon</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>
                                Your license will expire in {license_days_remaining} day{license_days_remaining !== 1 ? 's' : ''}.
                                Renew now to ensure uninterrupted service.
                            </p>
                        </div>
                        <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                                <button
                                    type="button"
                                    className="rounded-md bg-blue-50 px-2 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50"
                                    onClick={() => window.location.href = '/renew-license'}
                                >
                                    Renew License
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
