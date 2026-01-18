import React from "react";
import { router } from "@inertiajs/react";
import { IconStar, IconClock, IconTrendingUp } from "@tabler/icons-react";
import { useMenu } from "@/Utils/MenuBuilder";

/**
 * Quick Access Menu Component
 *
 * Displays frequently accessed menu items for quick navigation.
 * Shows favorites and recent items in a compact format.
 */
export default function QuickAccessMenu() {
    const { favoriteItems, recentItems, saveToRecent } = useMenu();

    const handleNavigation = (item) => {
        if (item.href) {
            saveToRecent(item);
            router.visit(item.href);
        }
    };

    // Don't show if no items
    if (favoriteItems.length === 0 && recentItems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Favorites */}
            {favoriteItems.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2 px-2">
                        <IconStar
                            size={14}
                            className="text-yellow-500"
                            strokeWidth={1.5}
                        />
                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Favorites
                        </h3>
                    </div>
                    <div className="space-y-1">
                        {favoriteItems.slice(0, 5).map((item) => (
                            <QuickAccessItem
                                key={item.id}
                                item={item}
                                onClick={() => handleNavigation(item)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Recent */}
            {recentItems.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2 px-2">
                        <IconClock
                            size={14}
                            className="text-blue-500"
                            strokeWidth={1.5}
                        />
                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            Recent
                        </h3>
                    </div>
                    <div className="space-y-1">
                        {recentItems.slice(0, 5).map((item) => (
                            <QuickAccessItem
                                key={item.id}
                                item={item}
                                onClick={() => handleNavigation(item)}
                                showTimestamp
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function QuickAccessItem({ item, onClick, showTimestamp = false }) {
    const Icon = item.icon;
    const timestamp = showTimestamp && item.timestamp;
    const timeAgo = timestamp ? getTimeAgo(timestamp) : null;

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        >
            {Icon && (
                <Icon
                    size={16}
                    strokeWidth={1.5}
                    className="text-slate-400 group-hover:text-primary-500"
                />
            )}
            <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {item.title}
                </div>
                {timeAgo && (
                    <div className="text-[10px] text-slate-400">
                        {timeAgo}
                    </div>
                )}
            </div>
        </button>
    );
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
