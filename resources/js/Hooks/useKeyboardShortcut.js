import { useEffect } from "react";

/**
 * Custom Hook for Keyboard Shortcuts
 *
 * Provides easy keyboard shortcut handling for menu navigation
 * and other application features.
 */

/**
 * Register a keyboard shortcut
 *
 * @param {string|string[]} keys - Key combination (e.g., 'k' or ['ctrl', 'k'])
 * @param {function} callback - Function to call when shortcut is triggered
 * @param {object} options - Additional options
 */
export function useKeyboardShortcut(keys, callback, options = {}) {
    const {
        enabled = true,
        preventDefault = true,
        target = window,
    } = options;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event) => {
            // Normalize keys to array
            const keyArray = Array.isArray(keys) ? keys : [keys];

            // Check if key combination matches
            const matches = keyArray.every((key) => {
                const lowerKey = key.toLowerCase();

                if (lowerKey === "ctrl" || lowerKey === "control") {
                    return event.ctrlKey;
                }
                if (lowerKey === "shift") {
                    return event.shiftKey;
                }
                if (lowerKey === "alt") {
                    return event.altKey;
                }
                if (lowerKey === "meta" || lowerKey === "cmd" || lowerKey === "⌘") {
                    return event.metaKey;
                }

                return event.key.toLowerCase() === lowerKey;
            });

            if (matches) {
                if (preventDefault) {
                    event.preventDefault();
                }
                callback(event);
            }
        };

        target.addEventListener("keydown", handleKeyDown);

        return () => {
            target.removeEventListener("keydown", handleKeyDown);
        };
    }, [keys, callback, enabled, preventDefault, target]);
}

/**
 * Common keyboard shortcuts for menu system
 */
export const MENU_SHORTCUTS = {
    SEARCH: ["meta", "k"], // Cmd/Ctrl + K
    SEARCH_ALT: ["ctrl", "k"],
    CLOSE: ["escape"],
    NAVIGATE_UP: ["arrowup"],
    NAVIGATE_DOWN: ["arrowdown"],
    SELECT: ["enter"],
};

/**
 * Hook for menu search shortcut
 */
export function useMenuSearchShortcut(callback) {
    useKeyboardShortcut(["meta", "k"], callback, { enabled: true });
    useKeyboardShortcut(["ctrl", "k"], callback, { enabled: true });
}

/**
 * Hook for ESC key
 */
export function useEscapeKey(callback, enabled = true) {
    useKeyboardShortcut("escape", callback, { enabled });
}

/**
 * Hook for navigation shortcuts
 */
export function useNavigationShortcuts(callbacks) {
    const { onUp, onDown, onSelect } = callbacks;

    useKeyboardShortcut("arrowup", onUp, { enabled: !!onUp });
    useKeyboardShortcut("arrowdown", onDown, { enabled: !!onDown });
    useKeyboardShortcut("enter", onSelect, { enabled: !!onSelect });
}

/**
 * Get keyboard shortcut display text
 */
export function getShortcutText(keys) {
    if (!Array.isArray(keys)) keys = [keys];

    return keys
        .map((key) => {
            const lower = key.toLowerCase();
            if (lower === "meta" || lower === "cmd") return "⌘";
            if (lower === "ctrl" || lower === "control") return "Ctrl";
            if (lower === "shift") return "Shift";
            if (lower === "alt") return "Alt";
            return key.toUpperCase();
        })
        .join("+");
}

/**
 * Check if user is on Mac
 */
export function isMac() {
    return typeof window !== "undefined" &&
        /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
}

/**
 * Get appropriate modifier key for platform
 */
export function getModifierKey() {
    return isMac() ? "⌘" : "Ctrl";
}

export default useKeyboardShortcut;
