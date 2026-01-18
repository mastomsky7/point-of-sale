import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import { IconLayoutGrid, IconSearch, IconCommand } from "@tabler/icons-react";
import LinkItem from "@/Components/Dashboard/LinkItem";
import LinkItemDropdown from "@/Components/Dashboard/LinkItemDropdown";
import MenuSearch from "@/Components/Dashboard/MenuSearch";
import Menu from "@/Utils/Menu";
import { useMenuSearchShortcut, getModifierKey } from "@/Hooks/useKeyboardShortcut";

export default function Sidebar({ sidebarOpen }) {
    const { auth } = usePage().props;
    const menuNavigation = Menu();
    const [searchOpen, setSearchOpen] = useState(false);

    // Keyboard shortcut for opening search (Cmd/Ctrl + K)
    useMenuSearchShortcut(() => setSearchOpen(true));

    return (
        <div
            className={`
            ${sidebarOpen ? "w-[260px]" : "w-[80px]"}
            hidden md:flex flex-col min-h-screen
            border-r border-slate-200 dark:border-slate-800
            bg-white dark:bg-slate-900
            transition-all duration-300 ease-in-out
        `}
        >
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-slate-100 dark:border-slate-800">
                {sidebarOpen ? (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                K
                            </span>
                        </div>
                        <span className="text-xl font-bold text-slate-800 dark:text-white">
                            KASIR
                        </span>
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">K</span>
                    </div>
                )}
            </div>

            {/* User Info */}
            <div
                className={`
                p-3 border-b border-slate-100 dark:border-slate-800
                ${
                    sidebarOpen
                        ? "flex items-center gap-3"
                        : "flex justify-center"
                }
            `}
            >
                <img
                    src={
                        auth.user.avatar ||
                        `https://ui-avatars.com/api/?name=${auth.user.name}&background=6366f1&color=fff`
                    }
                    className={`rounded-full ring-2 ring-slate-100 dark:ring-slate-800 ${
                        sidebarOpen ? "w-10 h-10" : "w-8 h-8"
                    }`}
                    alt={auth.user.name}
                />
                {sidebarOpen && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {auth.user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {auth.user.email}
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Search */}
            {sidebarOpen && (
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                    >
                        <IconSearch size={16} strokeWidth={1.5} className="text-slate-400 group-hover:text-primary-500" />
                        <span className="flex-1 text-left">Quick search...</span>
                        <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded">
                            {getModifierKey()}K
                        </kbd>
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {menuNavigation.map((section, index) => {
                    // Check if section has any accessible items
                    const hasAccessibleItems = section.details.some(
                        (detail) => detail.permissions === true || auth.super === true
                    );
                    if (!hasAccessibleItems) return null;

                    return (
                        <div key={index} className="mb-4">
                            {/* Section Title */}
                            {sidebarOpen && (
                                <div className="px-4 py-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                                            {section.title}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Divider for collapsed sidebar */}
                            {!sidebarOpen && index > 0 && (
                                <div className="my-2 mx-auto w-8 h-px bg-slate-200 dark:bg-slate-700" />
                            )}

                            {/* Menu Items */}
                            <div
                                className={
                                    sidebarOpen
                                        ? "space-y-0.5"
                                        : "flex flex-col items-center space-y-1"
                                }
                            >
                                {section.details.map((detail, idx) => {
                                    // Check permissions
                                    const canAccess = auth.super === true || detail.permissions === true;
                                    if (!canAccess) return null;

                                    // Check if item has subdetails (dropdown)
                                    if (detail.hasOwnProperty("subdetails") && Array.isArray(detail.subdetails)) {
                                        return (
                                            <LinkItemDropdown
                                                key={idx}
                                                title={detail.title}
                                                icon={detail.icon}
                                                data={detail.subdetails}
                                                access={detail.permissions}
                                                badge={detail.badge}
                                                description={detail.description}
                                                sidebarOpen={sidebarOpen}
                                            />
                                        );
                                    }

                                    // Regular menu item
                                    return (
                                        <LinkItem
                                            key={idx}
                                            title={detail.title}
                                            icon={detail.icon}
                                            href={detail.href}
                                            access={detail.permissions}
                                            badge={detail.badge}
                                            description={detail.description}
                                            shortcut={detail.shortcut}
                                            sidebarOpen={sidebarOpen}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Version/Footer */}
            {sidebarOpen && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center">
                        Point of Sales v2.0 Enterprise
                    </p>
                </div>
            )}

            {/* Menu Search Modal */}
            <MenuSearch
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </div>
    );
}
