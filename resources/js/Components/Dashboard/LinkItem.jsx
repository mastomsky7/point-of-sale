import React from "react";
import { Link, usePage } from "@inertiajs/react";

export default function LinkItem({
    href,
    icon,
    access,
    title,
    badge,
    description,
    shortcut,
    sidebarOpen,
    ...props
}) {
    const { url } = usePage();
    const { auth } = usePage().props;

    const isActive = url.startsWith(href);
    const canAccess = auth.super === true || access === true;

    if (!canAccess) return null;

    const baseClasses = `
        flex items-center gap-3
        transition-all duration-200
        text-slate-600 dark:text-slate-400
    `;

    const activeClasses = isActive
        ? "bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 border-l-[3px] border-primary-500"
        : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border-l-[3px] border-transparent";

    if (sidebarOpen) {
        return (
            <Link
                href={href}
                className={`${baseClasses} ${activeClasses} px-4 py-2.5 text-sm font-medium relative group`}
                title={description || title}
                {...props}
            >
                <span
                    className={
                        isActive ? "text-primary-600 dark:text-primary-400" : ""
                    }
                >
                    {icon}
                </span>
                <span className="truncate flex-1">{title}</span>

                {/* Shortcut badge */}
                {shortcut && !badge && (
                    <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded">
                        {shortcut}
                    </kbd>
                )}

                {/* Status badge */}
                {badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${badge.color}`}>
                        {badge.text}
                    </span>
                )}
            </Link>
        );
    }

    // Collapsed sidebar with tooltip
    return (
        <div className="relative group">
            <Link
                href={href}
                className={`
                    w-full flex justify-center py-3 rounded-lg
                    transition-all duration-200
                    ${
                        isActive
                            ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                `}
                title={title}
                {...props}
            >
                {icon}
                {badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
            </Link>

            {/* Tooltip for collapsed sidebar */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block z-50 min-w-[180px]">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {title}
                    </p>
                    {description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {description}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        {badge && (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold text-white ${badge.color}`}>
                                {badge.text}
                            </span>
                        )}
                        {shortcut && (
                            <kbd className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
                                {shortcut}
                            </kbd>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
