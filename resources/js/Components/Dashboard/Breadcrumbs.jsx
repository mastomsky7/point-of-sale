import React from "react";
import { Link } from "@inertiajs/react";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import { useMenu } from "@/Utils/MenuBuilder";

/**
 * Breadcrumbs Component
 *
 * Automatically generates breadcrumb navigation based on current menu location.
 * Provides context and easy navigation back to parent sections.
 */
export default function Breadcrumbs({ className = "" }) {
    const { breadcrumbs } = useMenu();

    if (!breadcrumbs || breadcrumbs.length === 0) {
        return null;
    }

    return (
        <nav
            className={`flex items-center space-x-2 text-sm ${className}`}
            aria-label="Breadcrumb"
        >
            {/* Home Icon */}
            <Link
                href={route("dashboard")}
                className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
            >
                <IconHome size={16} strokeWidth={1.5} />
            </Link>

            {/* Breadcrumb Items */}
            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                    <React.Fragment key={index}>
                        {/* Separator */}
                        <IconChevronRight
                            size={14}
                            className="text-slate-300 dark:text-slate-600"
                            strokeWidth={1.5}
                        />

                        {/* Breadcrumb Item */}
                        {crumb.href && !isLast ? (
                            <Link
                                href={crumb.href}
                                className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors font-medium"
                            >
                                {crumb.title}
                            </Link>
                        ) : (
                            <span
                                className={`${
                                    isLast
                                        ? "text-primary-600 dark:text-primary-400 font-semibold"
                                        : "text-slate-500 dark:text-slate-500"
                                }`}
                            >
                                {crumb.title}
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

/**
 * Breadcrumbs with Page Title
 *
 * Alternative version that combines breadcrumbs with page title
 */
export function BreadcrumbsWithTitle({ title, subtitle, actions, className = "" }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Breadcrumbs />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}
