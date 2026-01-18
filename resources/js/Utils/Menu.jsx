/**
 * Enterprise Menu System
 *
 * This file now serves as a compatibility layer for the new menu system.
 * It uses the centralized MenuBuilder to generate the menu structure.
 *
 * @deprecated Use useMenu() hook from MenuBuilder.js for new implementations
 */

import { usePage } from "@inertiajs/react";
import React from "react";
import { buildMenuStructure } from "./MenuBuilder";

/**
 * Legacy Menu Function
 *
 * Returns menu navigation structure for backwards compatibility.
 * For new code, prefer using the useMenu() hook from MenuBuilder.js
 */
export default function Menu() {
    const { url } = usePage();

    // Build menu using the enterprise menu builder
    const menuNavigation = buildMenuStructure(url);

    // Transform to include React elements for icons
    return menuNavigation.map((category) => ({
        ...category,
        details: category.details.map((item) => ({
            ...item,
            icon: item.icon ? <item.icon size={20} strokeWidth={1.5} /> : null,
            subdetails: item.subdetails?.map((sub) => ({
                ...sub,
                icon: sub.icon ? <sub.icon size={20} strokeWidth={1.5} /> : null,
            })),
        })),
    }));
}
