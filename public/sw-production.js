// Service Worker for Point of Sales PWA
// Version 3.0.0 - PRODUCTION MODE (Aggressive caching for offline support)

const CACHE_NAME = 'pos-v3-prod';
const RUNTIME_CACHE = 'pos-runtime-v3-prod';
const IMAGE_CACHE = 'pos-images-v3-prod';

// Assets to cache immediately for offline support
const PRECACHE_ASSETS = [
    '/',
    '/manifest.json',
    '/offline.html',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing v3.0.0 (PRODUCTION)...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching app shell');
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
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating v3.0.0 (PRODUCTION)...');
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
            console.log('[Service Worker] Taking control of all pages');
            return self.clients.claim();
        })
    );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle API requests - network first, cache as fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Handle images - cache first for performance
    if (request.destination === 'image') {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
        return;
    }

    // Handle navigation requests - network first with offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(navigationHandler(request));
        return;
    }

    // Handle other requests - stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request));
});

// Network first strategy - for API calls
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, using cache:', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline response for API calls
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'You are currently offline. This action will be queued.',
                offline: true
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Cache first strategy - for images and static assets
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

// Stale while revalidate - for CSS, JS, fonts
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);

    const networkPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => {
        // Network failed, but we already returned cache if available
    });

    return cachedResponse || networkPromise;
}

// Navigation handler - for page navigation
async function navigationHandler(request) {
    try {
        const networkResponse = await fetch(request);
        console.log('[Service Worker] Navigation success:', request.url);

        // Cache navigation responses
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, networkResponse.clone());

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Navigation failed, showing offline page');

        // Try to serve cached version first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Serve offline page
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }

        // Fallback offline message
        return new Response(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline</title>
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
                    .container { text-align: center; padding: 2rem; }
                    h1 { font-size: 3rem; margin: 0 0 1rem 0; }
                    p { font-size: 1.2rem; margin: 1rem 0; }
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
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📡 You're Offline</h1>
                    <p>Please check your internet connection</p>
                    <button onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `, {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/html' }
        });
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

// Push notification handler
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

// Message handler
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

console.log('[Service Worker] v3.0.0 Loaded - PRODUCTION MODE (Full Offline Support)');
