import React from 'react';

export default function FormCard({ children, className = '', maxWidth = '2xl' }) {
    const widthClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        'full': 'max-w-full',
    };

    return (
        <div className={`${widthClasses[maxWidth]} mx-auto`}>
            <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 ${className}`}>
                {children}
            </div>
        </div>
    );
}
