import React from 'react';
import { Link } from '@inertiajs/react';
import { IconArrowLeft } from '@tabler/icons-react';

export default function PageHeader({
    backRoute,
    backLabel = 'Kembali',
    title,
    icon: Icon,
    className = '',
}) {
    return (
        <div className={`mb-6 ${className}`}>
            {backRoute && (
                <Link
                    href={route(backRoute)}
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-3 transition-colors"
                >
                    <IconArrowLeft size={16} />
                    {backLabel}
                </Link>
            )}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {Icon && <Icon size={28} className="text-primary-500" />}
                {title}
            </h1>
        </div>
    );
}
