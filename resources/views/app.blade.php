<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <!-- PWA Meta Tags -->
    <meta name="application-name" content="Point of Sales">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="POS Pro">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#4f46e5">
    <meta name="description" content="Professional Point of Sales system for beauty salons, bars, and retail businesses with offline support">

    <!-- PWA Icons -->
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/png" sizes="192x192" href="/images/icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/icon-192x192.png">
    <link rel="shortcut icon" href="/favicon.ico">

    <!-- Fonts - Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead
    <style>
        body.dark {
            background-color: rgb(2 6 23);
        }

        body.light {
            background-color: rgb(248 250 252);
        }
    </style>
</head>

<body class="font-sans antialiased bg-slate-50 transition-colors duration-200" onload="setInitialTheme()">

    @inertia

    <!-- PWA Service Worker Registration -->
    <script>
        function setInitialTheme() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            if (darkMode) {
                document.body.classList.add('dark');
                document.body.classList.remove('light');
            } else {
                document.body.classList.add('light');
                document.body.classList.remove('dark');
            }
        }

        // Service Worker - DISABLED for development
        // Uncomment below to enable PWA features in production

        // Auto-unregister any existing Service Workers
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
                    console.log('[PWA] Service Worker unregistered for clean development');
                }
            });
        }

        // Clear all caches on page load
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                cacheNames.forEach(function(cacheName) {
                    caches.delete(cacheName);
                    console.log('[PWA] Cache deleted:', cacheName);
                });
            });
        }

        // Install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show custom install button/banner
            const installBanner = document.getElementById('install-banner');
            if (installBanner) {
                installBanner.style.display = 'block';
            }
        });

        window.installPWA = async () => {
            if (!deferredPrompt) {
                return;
            }

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User ${outcome} the install prompt`);
            deferredPrompt = null;

            const installBanner = document.getElementById('install-banner');
            if (installBanner) {
                installBanner.style.display = 'none';
            }
        };

        // Track online/offline status
        window.addEventListener('online', () => {
            console.log('Back online');
            // Trigger sync
            if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.sync.register('sync-transactions');
                    registration.sync.register('sync-appointments');
                });
            }
        });

        window.addEventListener('offline', () => {
            console.log('Gone offline');
        });
    </script>
</body>

</html>
