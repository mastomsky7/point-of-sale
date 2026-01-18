/**
 * Enterprise Menu Builder
 *
 * Provides utilities for building and managing enterprise-grade menu structures.
 * Handles permissions, role-based filtering, and dynamic menu generation.
 */

import { usePage } from "@inertiajs/react";
import hasAnyPermission from "./Permission";
import { MENU_STRUCTURE, MENU_TYPES } from "@/Config/MenuConfig";

/**
 * Check if a menu item should be displayed based on permissions
 */
export const hasMenuPermission = (permissions) => {
    if (!permissions || permissions.length === 0) return true;
    return hasAnyPermission(permissions);
};

/**
 * Check if current URL matches a route
 */
export const isRouteActive = (routeName, currentUrl) => {
    try {
        const routeUrl = route(routeName);
        return currentUrl === routeUrl || currentUrl.startsWith(routeUrl);
    } catch (error) {
        return false;
    }
};

/**
 * Build a single menu item
 */
export const buildMenuItem = (item, currentUrl) => {
    // Validate item
    if (!item || typeof item !== 'object') {
        return null;
    }

    if (!hasMenuPermission(item.permissions)) {
        return null;
    }

    const baseItem = {
        id: item.id || 'unknown',
        type: item.type || MENU_TYPES.SINGLE,
        title: item.title || 'Untitled',
        icon: item.icon || null,
        badge: item.badge || null,
        description: item.description || '',
        shortcut: item.shortcut || null,
        permissions: item.permissions || [],
    };

    if (item.type === MENU_TYPES.SINGLE) {
        return {
            ...baseItem,
            href: item.route ? route(item.route) : null,
            active: item.route ? isRouteActive(item.route, currentUrl) : false,
        };
    }

    if (item.type === MENU_TYPES.DROPDOWN && item.children) {
        const children = item.children
            .map((child) => buildMenuItem({ ...child, type: MENU_TYPES.SINGLE }, currentUrl))
            .filter(Boolean);

        if (children.length === 0) return null;

        return {
            ...baseItem,
            subdetails: children,
            active: children.some((child) => child && child.active),
        };
    }

    return baseItem;
};

/**
 * Build menu category with items
 */
export const buildMenuCategory = (categoryConfig, currentUrl) => {
    // Validate category config
    if (!categoryConfig || !categoryConfig.items || !Array.isArray(categoryConfig.items)) {
        return null;
    }

    const items = categoryConfig.items
        .map((item) => buildMenuItem(item, currentUrl))
        .filter(Boolean);

    if (items.length === 0) return null;

    return {
        title: categoryConfig.category || 'Untitled Category',
        priority: categoryConfig.priority || 99,
        icon: categoryConfig.icon || null,
        details: items,
    };
};

/**
 * Build complete menu structure
 */
export const buildMenuStructure = (currentUrl) => {
    // Validate and ensure MENU_STRUCTURE is an array
    if (!Array.isArray(MENU_STRUCTURE)) {
        console.error('MENU_STRUCTURE is not an array');
        return [];
    }

    return MENU_STRUCTURE
        .map((category) => buildMenuCategory(category, currentUrl))
        .filter(Boolean)
        .sort((a, b) => (a?.priority || 99) - (b?.priority || 99));
};

/**
 * Get menu item by ID
 */
export const getMenuItemById = (menuStructure, itemId) => {
    if (!Array.isArray(menuStructure) || !itemId) {
        return null;
    }

    for (const category of menuStructure) {
        if (!category || !Array.isArray(category.details)) continue;

        for (const item of category.details) {
            if (!item) continue;
            if (item.id === itemId) return item;

            if (item.subdetails && Array.isArray(item.subdetails)) {
                const subItem = item.subdetails.find((sub) => sub && sub.id === itemId);
                if (subItem) return subItem;
            }
        }
    }
    return null;
};

/**
 * Get active menu item
 */
export const getActiveMenuItem = (menuStructure) => {
    if (!Array.isArray(menuStructure)) {
        return null;
    }

    for (const category of menuStructure) {
        if (!category || !Array.isArray(category.details)) continue;

        for (const item of category.details) {
            if (!item) continue;
            if (item.active) return item;

            if (item.subdetails && Array.isArray(item.subdetails)) {
                const activeSubItem = item.subdetails.find((sub) => sub && sub.active);
                if (activeSubItem) return activeSubItem;
            }
        }
    }
    return null;
};

/**
 * Get breadcrumb trail for current page
 */
export const getBreadcrumbs = (menuStructure, currentUrl) => {
    const breadcrumbs = [];

    if (!Array.isArray(menuStructure)) {
        return breadcrumbs;
    }

    for (const category of menuStructure) {
        if (!category || !Array.isArray(category.details)) continue;

        for (const item of category.details) {
            if (!item) continue;

            const hasActiveSubItem = item.subdetails && Array.isArray(item.subdetails) &&
                                     item.subdetails.some((sub) => sub && sub.active);

            if (item.active || hasActiveSubItem) {
                breadcrumbs.push({
                    title: category.title || 'Unknown',
                    href: null,
                });

                if (item.type === MENU_TYPES.SINGLE && item.active) {
                    breadcrumbs.push({
                        title: item.title || 'Unknown',
                        href: item.href || null,
                    });
                } else if (item.subdetails && Array.isArray(item.subdetails)) {
                    const activeSubItem = item.subdetails.find((sub) => sub && sub.active);
                    if (activeSubItem) {
                        breadcrumbs.push({
                            title: item.title || 'Unknown',
                            href: null,
                        });
                        breadcrumbs.push({
                            title: activeSubItem.title || 'Unknown',
                            href: activeSubItem.href || null,
                        });
                    }
                }

                return breadcrumbs;
            }
        }
    }

    return breadcrumbs;
};

/**
 * Filter menu by search query
 */
export const searchMenu = (menuStructure, query) => {
    if (!Array.isArray(menuStructure) || !query || query.trim() === '') {
        return Array.isArray(menuStructure) ? menuStructure : [];
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const category of menuStructure) {
        if (!category || !Array.isArray(category.details)) continue;

        const matchingItems = [];

        for (const item of category.details) {
            if (!item) continue;

            const titleMatch = item.title && item.title.toLowerCase().includes(lowerQuery);
            const descMatch = item.description && item.description.toLowerCase().includes(lowerQuery);

            if (titleMatch || descMatch) {
                matchingItems.push(item);
            } else if (item.subdetails && Array.isArray(item.subdetails)) {
                const matchingSubItems = item.subdetails.filter((sub) => {
                    if (!sub) return false;
                    const subTitleMatch = sub.title && sub.title.toLowerCase().includes(lowerQuery);
                    const subDescMatch = sub.description && sub.description.toLowerCase().includes(lowerQuery);
                    return subTitleMatch || subDescMatch;
                });

                if (matchingSubItems.length > 0) {
                    matchingItems.push({
                        ...item,
                        subdetails: matchingSubItems,
                    });
                }
            }
        }

        if (matchingItems.length > 0) {
            results.push({
                ...category,
                details: matchingItems,
            });
        }
    }

    return results;
};

/**
 * Get menu statistics
 */
export const getMenuStatistics = (menuStructure) => {
    let totalCategories = 0;
    let totalItems = 0;
    let totalSubItems = 0;
    let activeItems = 0;

    if (!Array.isArray(menuStructure)) {
        return {
            totalCategories: 0,
            totalItems: 0,
            totalSubItems: 0,
            activeItems: 0,
            totalVisibleItems: 0,
        };
    }

    menuStructure.forEach((category) => {
        if (!category || !Array.isArray(category.details)) return;

        totalCategories++;
        category.details.forEach((item) => {
            if (!item) return;

            totalItems++;
            if (item.active) activeItems++;

            if (item.subdetails && Array.isArray(item.subdetails)) {
                totalSubItems += item.subdetails.length;
                activeItems += item.subdetails.filter((sub) => sub && sub.active).length;
            }
        });
    });

    return {
        totalCategories,
        totalItems,
        totalSubItems,
        activeItems,
        totalVisibleItems: totalItems + totalSubItems,
    };
};

/**
 * Group menu items by category
 */
export const groupMenuByCategory = (menuStructure) => {
    const grouped = {};

    menuStructure.forEach((category) => {
        grouped[category.title] = category.details;
    });

    return grouped;
};

/**
 * Get recent menu items (for quick access)
 */
export const getRecentMenuItems = (limit = 5) => {
    const recentItems = localStorage.getItem('recent_menu_items');
    if (!recentItems) return [];

    try {
        const items = JSON.parse(recentItems);
        return items.slice(0, limit);
    } catch (error) {
        return [];
    }
};

/**
 * Save menu item to recent history
 */
export const saveToRecentMenuItems = (item) => {
    if (!item || !item.id) return;

    try {
        const recentItems = getRecentMenuItems(10);
        const filtered = recentItems.filter((i) => i.id !== item.id);

        const newRecent = [
            {
                id: item.id,
                title: item.title,
                href: item.href,
                icon: item.icon,
                timestamp: Date.now(),
            },
            ...filtered,
        ];

        localStorage.setItem('recent_menu_items', JSON.stringify(newRecent.slice(0, 10)));
    } catch (error) {
        console.error('Failed to save recent menu item:', error);
    }
};

/**
 * Get favorite menu items
 */
export const getFavoriteMenuItems = () => {
    const favorites = localStorage.getItem('favorite_menu_items');
    if (!favorites) return [];

    try {
        return JSON.parse(favorites);
    } catch (error) {
        return [];
    }
};

/**
 * Toggle menu item as favorite
 */
export const toggleMenuFavorite = (item) => {
    if (!item || !item.id) return false;

    try {
        const favorites = getFavoriteMenuItems();
        const existingIndex = favorites.findIndex((f) => f.id === item.id);

        if (existingIndex >= 0) {
            favorites.splice(existingIndex, 1);
        } else {
            favorites.push({
                id: item.id,
                title: item.title,
                href: item.href,
                icon: item.icon,
            });
        }

        localStorage.setItem('favorite_menu_items', JSON.stringify(favorites));
        return existingIndex < 0; // Return true if added, false if removed
    } catch (error) {
        console.error('Failed to toggle favorite:', error);
        return false;
    }
};

/**
 * Check if menu item is favorited
 */
export const isMenuItemFavorited = (itemId) => {
    const favorites = getFavoriteMenuItems();
    return favorites.some((f) => f.id === itemId);
};

/**
 * Custom hook for menu management
 */
export const useMenu = () => {
    const { url } = usePage();
    const menuStructure = buildMenuStructure(url);

    return {
        menuStructure,
        activeItem: getActiveMenuItem(menuStructure),
        breadcrumbs: getBreadcrumbs(menuStructure, url),
        statistics: getMenuStatistics(menuStructure),
        searchMenu: (query) => searchMenu(menuStructure, query),
        getItemById: (id) => getMenuItemById(menuStructure, id),
        recentItems: getRecentMenuItems(),
        favoriteItems: getFavoriteMenuItems(),
        toggleFavorite: toggleMenuFavorite,
        isFavorited: isMenuItemFavorited,
        saveToRecent: saveToRecentMenuItems,
    };
};

export default {
    buildMenuStructure,
    buildMenuCategory,
    buildMenuItem,
    getMenuItemById,
    getActiveMenuItem,
    getBreadcrumbs,
    searchMenu,
    getMenuStatistics,
    groupMenuByCategory,
    getRecentMenuItems,
    saveToRecentMenuItems,
    getFavoriteMenuItems,
    toggleMenuFavorite,
    isMenuItemFavorited,
    useMenu,
};
