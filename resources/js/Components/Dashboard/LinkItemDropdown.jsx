import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

export default function LinkItemDropdown({
    icon,
    title,
    data,
    access,
    badge,
    description,
    sidebarOpen,
    ...props
}) {
    const { url } = usePage();
    const { auth } = usePage().props;

    // Check if any submenu is active
    const hasActiveSubItem = data.some((item) =>
        item.href && url.startsWith(item.href)
    );

    // Auto-open if has active sub-item
    const [isOpen, setIsOpen] = useState(hasActiveSubItem);

    useEffect(() => {
        if (hasActiveSubItem) {
            setIsOpen(true);
        }
    }, [hasActiveSubItem, url]);

    const canAccess = auth.super === true || access === true;
    if (!canAccess) return null;

    const baseClasses = `
        flex items-center gap-3 w-full
        transition-all duration-200
        text-slate-600 dark:text-slate-400
    `;

    const activeClasses = hasActiveSubItem
        ? "bg-primary-50/50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400"
        : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200";

    if (sidebarOpen) {
        return (
            <div className="w-full">
                {/* Dropdown Header */}
                <button
                    className={`${baseClasses} ${activeClasses} px-4 py-2.5 text-sm font-medium`}
                    onClick={() => setIsOpen(!isOpen)}
                    title={description || title}
                >
                    <span className={hasActiveSubItem ? "text-primary-600 dark:text-primary-400" : ""}>
                        {icon}
                    </span>
                    <span className="truncate flex-1 text-left">{title}</span>

                    {/* Badge */}
                    {badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${badge.color}`}>
                            {badge.text}
                        </span>
                    )}

                    {/* Chevron */}
                    <IconChevronDown
                        size={16}
                        strokeWidth={2}
                        className={`
                            transition-transform duration-200
                            ${isOpen ? 'rotate-180' : ''}
                            ${hasActiveSubItem ? 'text-primary-600 dark:text-primary-400' : ''}
                        `}
                    />
                </button>

                {/* Dropdown Items */}
                {isOpen && (
                    <div className="pl-8 pr-2 py-1 space-y-0.5">
                        {data.map((item, index) => {
                            const itemCanAccess = auth.super === true || item.permissions === true;
                            if (!itemCanAccess) return null;

                            const isActive = item.href && url.startsWith(item.href);

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-2.5 px-3 py-2 rounded-lg
                                        text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? 'bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 border-l-2 border-primary-500'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border-l-2 border-transparent'
                                        }
                                    `}
                                    title={item.description || item.title}
                                    {...props}
                                >
                                    {item.icon && (
                                        <span className={`flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                                            {item.icon}
                                        </span>
                                    )}
                                    <span className="truncate flex-1">{item.title}</span>

                                    {/* Item Badge */}
                                    {item.badge && (
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold text-white ${item.badge.color}`}>
                                            {item.badge.text}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Collapsed sidebar - show icon with tooltip
    return (
        <div className="relative group">
            <button
                className={`
                    w-full flex justify-center py-3 rounded-lg
                    transition-all duration-200
                    ${hasActiveSubItem
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                `}
                onClick={() => setIsOpen(!isOpen)}
                title={title}
            >
                {icon}
            </button>

            {/* Tooltip with submenu for collapsed sidebar */}
            <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50 min-w-[200px]">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2">
                    {/* Header */}
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {title}
                        </p>
                        {badge && (
                            <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${badge.color}`}>
                                {badge.text}
                            </span>
                        )}
                    </div>

                    {/* Submenu Items */}
                    <div className="py-1">
                        {data.map((item, index) => {
                            const itemCanAccess = auth.super === true || item.permissions === true;
                            if (!itemCanAccess) return null;

                            const isActive = item.href && url.startsWith(item.href);

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-2.5 px-4 py-2
                                        text-sm transition-colors
                                        ${isActive
                                            ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                                        }
                                    `}
                                    title={item.description || item.title}
                                >
                                    {item.icon && (
                                        <span className="flex-shrink-0">
                                            {item.icon}
                                        </span>
                                    )}
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
