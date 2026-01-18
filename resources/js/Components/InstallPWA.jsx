import { useState, useEffect } from 'react';
import { IconDownload, IconX } from '@tabler/icons-react';

export default function InstallPWA() {
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user dismissed the banner before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

            // Show again after 7 days
            if (daysSinceDismissed < 7) {
                return;
            }
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowBanner(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = () => {
        if (typeof window.installPWA === 'function') {
            window.installPWA();
            setShowBanner(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        setShowBanner(false);
    };

    if (isInstalled || !showBanner) {
        return null;
    }

    return (
        <div
            id="install-banner"
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-2xl p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <IconDownload className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">
                            Install POS Pro
                        </h3>
                        <p className="text-indigo-100 text-xs mt-1">
                            Install our app for offline access, faster performance, and a better experience!
                        </p>

                        <div className="flex items-center space-x-2 mt-3">
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-white text-indigo-600 rounded-md text-xs font-semibold hover:bg-indigo-50 transition-colors"
                            >
                                Install Now
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 bg-indigo-700 text-white rounded-md text-xs font-medium hover:bg-indigo-800 transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-white hover:text-indigo-200 transition-colors"
                    >
                        <IconX className="w-5 h-5" />
                    </button>
                </div>

                {/* Features */}
                <div className="mt-3 pt-3 border-t border-indigo-500">
                    <ul className="space-y-1.5">
                        <li className="flex items-center space-x-2 text-xs text-indigo-100">
                            <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Works 100% offline</span>
                        </li>
                        <li className="flex items-center space-x-2 text-xs text-indigo-100">
                            <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Faster than browser</span>
                        </li>
                        <li className="flex items-center space-x-2 text-xs text-indigo-100">
                            <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>No app store needed</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
