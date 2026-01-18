// Service Worker for Point of Sales PWA
// Version 3.0.0 - DEVELOPMENT MODE (No aggressive caching, prevents reload loops)

const CACHE_NAME = 'pos-v3-dev';
const RUNTIME_CACHE = 'pos-runtime-v3-dev';
const IMAGE_CACHE = 'pos-images-v3-dev';

// Assets to cache immediately (REMOVED offline.html to prevent stuck offline page)
const PRECACHE_ASSETS = [
    '/manifest.json',
];

// Install event - minimal caching for development
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing v3.0.0 (DEV MODE)...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Minimal precaching for development');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Clearing old caches...');
                return caches.keys().then((cacheNames) => {
                    return Promise.all(
                        cacheNames
                            .filter((cacheName) => cacheName.startsWith('pos-v') && !cacheName.includes('v3'))
                            .map((cacheName) => {
                                console.log('[Service Worker] Deleting old cache:', cacheName);
                                return caches.delete(cacheName);
                            })
                    );
                });
            })
            // DO NOT skip waiting in dev mode - let user reload manually
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating v3.0.0 (DEV MODE)...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        return cacheName.startsWith('pos-') &&
                               cacheName !== CACHE_NAME &&
                               cacheName !== RUNTIME_CACHE &&
                               cacheName !== IMAGE_CACHE;
                    })
                    .map((cacheName) => {
                        console.log('[Service Worker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            console.log('[Service Worker] Taking control - DEV MODE');
            // Don't claim clients immediately in dev mode
            // return self.clients.claim();
        })
    );
});

// Fetch event - DEVELOPMENT MODE: Network first for everything
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip API calls - always go to network, no caching
    if (url.pathname.startsWith('/api/')) {
        return; // Let browser handle it
    }

    // DEV MODE: Always try network first, minimal caching
    event.respondWith(devNetworkFirst(request));
});

// DEVELOPMENT MODE: Network first, NO aggressive caching
async function devNetworkFirst(request) {
    try {
        // Always fetch from network in dev mode
        const networkResponse = await fetch(request);

        // DO NOT cache in dev mode to avoid stale data
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed (dev mode):', request.url);

        // Only show offline for navigation requests
        if (request.mode === 'navigate') {
            return new Response(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Offline - Dev Mode</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                        }
                        .container {
                            text-align: center;
                            padding: 2rem;
                            max-width: 500px;
                        }
                        h1 { font-size: 2.5rem; margin: 0 0 1rem 0; }
                        .mode-badge {
                            display: inline-block;
                            background: rgba(255,255,255,0.2);
                            padding: 0.5rem 1rem;
                            border-radius: 2rem;
                            font-size: 0.875rem;
                            margin-bottom: 1rem;
                        }
                        p { font-size: 1.1rem; margin: 1rem 0; line-height: 1.6; }
                        button {
                            background: white;
                            color: #667eea;
                            border: none;
                            padding: 1rem 2rem;
                            font-size: 1rem;
                            font-weight: 600;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            margin-top: 1rem;
                            transition: transform 0.2s;
                        }
                        button:hover { transform: scale(1.05); }
                        .dev-note {
                            margin-top: 2rem;
                            padding: 1rem;
                            background: rgba(0,0,0,0.2);
                            border-radius: 0.5rem;
                            font-size: 0.875rem;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="mode-badge">DEV MODE</div>
                        <h1>📡 Server Unavailable</h1>
                        <p>Make sure your Laravel development server is running:</p>
                        <p><code>php artisan serve</code></p>
                        <button onclick="window.location.reload()">Retry Connection</button>
                        <div class="dev-note">
                            <strong>Development Mode Active</strong><br>
                            Service Worker is using minimal caching to ensure fresh data
                        </div>
                    </div>
                </body>
                </html>
            `, {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html' }
            });
        }

        throw error;
    }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Fetch failed:', request.url);
        return new Response('Offline', { status: 503 });
    }
}

// Navigation handler - FIXED: Always try network first, minimal offline fallback
async function navigationHandler(request) {
    try {
        const networkResponse = await fetch(request);
        console.log('[Service Worker] Navigation success:', request.url);
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Navigation failed - truly offline:', request.url);
        // Only show offline page if truly offline (no network)
        // Check if we have cached version first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[Service Worker] Serving cached page');
            return cachedResponse;
        }
        // Last resort: show basic offline message (NOT the cached offline.html)
        return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
                <title>Offline</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                    h1 { color: #333; }
                    p { color: #666; }
                    button { background: #4f46e5; color: white; border: none; padding: 12px 24px; font-size: 16px; cursor: pointer; border-radius: 6px; margin-top: 20px; }
                    button:hover { background: #4338ca; }
                </style>
            </head>
            <body>
                <h1>No Internet Connection</h1>
                <p>Server is unavailable. Please check your connection and try again.</p>
                <button onclick="window.location.reload()">Retry</button>
            </body>
            </html>`,
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

// Background Sync - handle offline transactions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-transactions') {
        event.waitUntil(syncTransactions());
    }

    if (event.tag === 'sync-appointments') {
        event.waitUntil(syncAppointments());
    }
});

async function syncTransactions() {
    console.log('[Service Worker] Syncing offline transactions...');

    try {
        const db = await openIndexedDB();
        const transactions = await getOfflineTransactions(db);

        for (const transaction of transactions) {
            try {
                const response = await fetch('/api/transactions/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(transaction),
                });

                if (response.ok) {
                    await removeOfflineTransaction(db, transaction.id);
                    console.log('[Service Worker] Transaction synced:', transaction.id);
                }
            } catch (error) {
                console.error('[Service Worker] Failed to sync transaction:', error);
            }
        }
    } catch (error) {
        console.error('[Service Worker] Sync error:', error);
    }
}

async function syncAppointments() {
    console.log('[Service Worker] Syncing offline appointments...');

    try {
        const db = await openIndexedDB();
        const appointments = await getOfflineAppointments(db);

        for (const appointment of appointments) {
            try {
                const response = await fetch('/api/appointments/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(appointment),
                });

                if (response.ok) {
                    await removeOfflineAppointment(db, appointment.id);
                    console.log('[Service Worker] Appointment synced:', appointment.id);
                }
            } catch (error) {
                console.error('[Service Worker] Failed to sync appointment:', error);
            }
        }
    } catch (error) {
        console.error('[Service Worker] Sync error:', error);
    }
}

// IndexedDB helpers
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pos-offline-db', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('transactions')) {
                db.createObjectStore('transactions', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('appointments')) {
                db.createObjectStore('appointments', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('products')) {
                db.createObjectStore('products', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('services')) {
                db.createObjectStore('services', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('customers')) {
                db.createObjectStore('customers', { keyPath: 'id' });
            }
        };
    });
}

function getOfflineTransactions(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['transactions'], 'readonly');
        const store = transaction.objectStore('transactions');
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function getOfflineAppointments(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['appointments'], 'readonly');
        const store = transaction.objectStore('appointments');
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function removeOfflineTransaction(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['transactions'], 'readwrite');
        const store = transaction.objectStore('transactions');
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

function removeOfflineAppointment(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['appointments'], 'readwrite');
        const store = transaction.objectStore('appointments');
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

// Push notification handler (for future WhatsApp integration)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'POS Notification';
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png',
        data: data.data || {},
        actions: data.actions || [],
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Message handler for cache updates and control
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log('[Service Worker] Clearing cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }

    if (event.data.type === 'CACHE_PRODUCTS') {
        cacheProducts(event.data.products);
    }

    if (event.data.type === 'CACHE_SERVICES') {
        cacheServices(event.data.services);
    }
});

async function cacheProducts(products) {
    const db = await openIndexedDB();
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    for (const product of products) {
        store.put(product);
    }
}

async function cacheServices(services) {
    const db = await openIndexedDB();
    const transaction = db.transaction(['services'], 'readwrite');
    const store = transaction.objectStore('services');

    for (const service of services) {
        store.put(service);
    }
}

console.log('[Service Worker] v3.0.0 Loaded - DEVELOPMENT MODE (Network First, No Reload Loops)');
