// service-worker.js

// Cache name
const CACHE_NAME = 'v1';

// Files to cache
const CACHE_ASSETS = [
    '/',
    'index.html',
    'styles.css', // Add your CSS file if any
    'game.js',    // Add your JavaScript file if any
    'assets/favicon.ico',
    'assets/apple-touch-icon.png',
    'assets/startup-image.png',
    'assets/media.png' // Add any other files you need to cache
];

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching assets');
                return cache.addAll(CACHE_ASSETS);
            })
            .catch((error) => {
                console.error('Caching failed:', error);
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse; // Return cached response if available
                }
                return fetch(event.request); // Fetch from network if not in cache
            })
            .catch((error) => {
                console.error('Fetching failed:', error);
                throw error;
            })
    );
});
