import React, { useState, useEffect, useRef } from "react";
import { IconSearch, IconStar, IconClock, IconX, IconCommand } from "@tabler/icons-react";
import { router } from "@inertiajs/react";
import { useMenu } from "@/Utils/MenuBuilder";
import { useEscapeKey, getModifierKey } from "@/Hooks/useKeyboardShortcut";

export default function MenuSearch({ isOpen, onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const {
        searchMenu,
        menuStructure,
        recentItems,
        favoriteItems,
        saveToRecent,
    } = useMenu();

    // ESC key to close
    useEscapeKey(onClose, isOpen);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim()) {
            const searchResults = searchMenu(query);
            setResults(searchResults);
        } else {
            setResults([]);
        }
    }, [query]);

    const handleItemClick = (item) => {
        if (item.href) {
            saveToRecent(item);
            router.visit(item.href);
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        const allItems = getAllSelectableItems();

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev < allItems.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter" && allItems[selectedIndex]) {
            e.preventDefault();
            handleItemClick(allItems[selectedIndex]);
        }
    };

    const getAllSelectableItems = () => {
        const items = [];

        if (query.trim()) {
            // Search results
            if (Array.isArray(results)) {
                results.forEach((category) => {
                    if (category && Array.isArray(category.details)) {
                        category.details.forEach((item) => {
                            if (!item) return;

                            if (item.subdetails && Array.isArray(item.subdetails)) {
                                item.subdetails.forEach((sub) => {
                                    if (sub) items.push(sub);
                                });
                            } else {
                                items.push(item);
                            }
                        });
                    }
                });
            }
        } else {
            // Favorites and recent
            if (Array.isArray(favoriteItems)) {
                items.push(...favoriteItems.filter(Boolean));
            }
            if (Array.isArray(recentItems)) {
                items.push(...recentItems.filter(Boolean));
            }
        }

        return items.filter(Boolean);
    };

    if (!isOpen) return null;

    const displayItems = query.trim() ? results : [];
    const showRecent = !query.trim() && recentItems.length > 0;
    const showFavorites = !query.trim() && favoriteItems.length > 0;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <IconSearch
                            size={20}
                            className="text-slate-400"
                            strokeWidth={1.5}
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search menu..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <IconX size={18} strokeWidth={1.5} />
                            </button>
                        )}
                        <div className="hidden md:flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
                                ESC
                            </kbd>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto">
                        {/* Search Results */}
                        {displayItems.length > 0 && (
                            <div className="p-2">
                                {displayItems.map((category, catIdx) => {
                                    if (!category || !category.details) return null;

                                    return (
                                        <div key={catIdx} className="mb-2">
                                            <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase">
                                                {category.title || 'Unknown'}
                                            </div>
                                            {category.details.map((item, itemIdx) => {
                                                if (!item) return null;

                                                return (
                                                    <div key={itemIdx}>
                                                        {item.subdetails && Array.isArray(item.subdetails) ? (
                                                            item.subdetails.map(
                                                                (sub, subIdx) => {
                                                                    if (!sub) return null;
                                                                    return (
                                                                        <SearchResultItem
                                                                            key={subIdx}
                                                                            item={sub}
                                                                            onClick={() =>
                                                                                handleItemClick(
                                                                                    sub
                                                                                )
                                                                            }
                                                                        />
                                                                    );
                                                                }
                                                            )
                                                        ) : (
                                                            <SearchResultItem
                                                                item={item}
                                                                onClick={() =>
                                                                    handleItemClick(item)
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* No Results */}
                        {query.trim() && displayItems.length === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                No results found for "{query}"
                            </div>
                        )}

                        {/* Favorites */}
                        {showFavorites && (
                            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-400 uppercase">
                                    <IconStar size={14} strokeWidth={1.5} />
                                    Favorites
                                </div>
                                {favoriteItems.map((item, idx) => {
                                    if (!item) return null;
                                    return (
                                        <SearchResultItem
                                            key={idx}
                                            item={item}
                                            onClick={() => handleItemClick(item)}
                                            showIcon={false}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {/* Recent */}
                        {showRecent && (
                            <div className="p-2">
                                <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-400 uppercase">
                                    <IconClock size={14} strokeWidth={1.5} />
                                    Recent
                                </div>
                                {recentItems.map((item, idx) => {
                                    if (!item) return null;
                                    return (
                                        <SearchResultItem
                                            key={idx}
                                            item={item}
                                            onClick={() => handleItemClick(item)}
                                            showIcon={false}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {/* Empty State */}
                        {!query.trim() &&
                            !showRecent &&
                            !showFavorites && (
                                <div className="p-8 text-center text-slate-400">
                                    Type to search menu items...
                                </div>
                            )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-4">
                                <span>
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs">
                                        ↑↓
                                    </kbd>{" "}
                                    Navigate
                                </span>
                                <span>
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs">
                                        ↵
                                    </kbd>{" "}
                                    Select
                                </span>
                            </div>
                            <span>
                                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs">
                                    ESC
                                </kbd>{" "}
                                Close
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function SearchResultItem({ item, onClick, showIcon = true }) {
    // Validate item
    if (!item || typeof item !== 'object') {
        return null;
    }

    const Icon = item.icon;

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
        >
            {showIcon && Icon && (
                <Icon
                    size={18}
                    strokeWidth={1.5}
                    className="text-slate-400 group-hover:text-primary-500"
                />
            )}
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                    {item.title || 'Untitled'}
                </div>
                {item.description && (
                    <div className="text-xs text-slate-400 truncate">
                        {item.description}
                    </div>
                )}
            </div>
            {item.badge && item.badge.text && (
                <span
                    className={`px-2 py-0.5 text-xs font-semibold text-white rounded ${item.badge.color || 'bg-gray-500'}`}
                >
                    {item.badge.text}
                </span>
            )}
        </button>
    );
}
