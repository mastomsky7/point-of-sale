import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { IconMenu2, IconMoon, IconSun, IconSearch } from "@tabler/icons-react";
import AuthDropdown from "@/Components/Dashboard/AuthDropdown";
// import StoreSwitcher from "@/Components/Dashboard/StoreSwitcher"; // Temporarily disabled for testing
import Menu from "@/Utils/Menu";
import Notification from "@/Components/Dashboard/Notification";

export default function Navbar({ toggleSidebar, themeSwitcher, darkMode }) {
    const { auth, stores } = usePage().props;
    const menuNavigation = Menu();

    // Get current page title
    const links = Array.isArray(menuNavigation)
        ? menuNavigation.flatMap((item) => item && item.details ? item.details : []).filter(Boolean)
        : [];

    const sublinks = links
        .filter((item) => item && item.hasOwnProperty("subdetails") && Array.isArray(item.subdetails))
        .flatMap((item) => item.subdetails || [])
        .filter(Boolean);

    const getCurrentTitle = () => {
        for (const link of links) {
            if (!link) continue;

            if (link.hasOwnProperty("subdetails") && Array.isArray(link.subdetails)) {
                const activeSublink = sublinks.find((s) => s && s.hasOwnProperty("active") && s.active);
                if (activeSublink && activeSublink.title) return activeSublink.title;
            } else if (link.hasOwnProperty("active") && link.active && link.title) {
                return link.title;
            }
        }
        return "Dashboard";
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <header
            className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6
            bg-white dark:bg-slate-900
            border-b border-slate-200 dark:border-slate-800
            transition-colors duration-200"
        >
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Toggle Sidebar"
                >
                    <IconMenu2 size={20} strokeWidth={1.5} />
                </button>

                {/* Mobile Logo */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">K</span>
                    </div>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">
                        KASIR
                    </span>
                </div>

                {/* Current Page Title */}
                <div className="hidden md:flex items-center">
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mr-4" />
                    <h1 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                        {getCurrentTitle()}
                    </h1>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {/* Store Switcher */}
                {/* Temporarily disabled for testing
                {stores?.available && stores.available.length > 0 && (
                    <StoreSwitcher
                        stores={stores.available}
                        currentStore={stores.current}
                    />
                )}
                */}

                {/* Theme Toggle */}
                <button
                    onClick={themeSwitcher}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title={darkMode ? "Light Mode" : "Dark Mode"}
                >
                    {darkMode ? (
                        <IconSun
                            size={20}
                            strokeWidth={1.5}
                            className="text-amber-500"
                        />
                    ) : (
                        <IconMoon size={20} strokeWidth={1.5} />
                    )}
                </button>

                {/* Notifications */}
                <Notification />

                {/* Divider */}
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />

                {/* User Dropdown */}
                <AuthDropdown auth={auth} isMobile={isMobile} />
            </div>
        </header>
    );
}
