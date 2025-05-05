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
    'assets/media.png', // Add any other files you need to cache
    'assets/theme.mp3', // Add the audio file for caching
    'assets/intro.mp3', // Add any other audio files you might use
    'assets/jump.ogg',
    'assets/ghost.ogg',
    'assets/die.ogg',
    'assets/ready.ogg',
    'assets/go.ogg',
    'assets/end.mp3'
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

// Fetch event with enhanced caching
self.addEventListener('fetch', (event) => {
    // Check for specific requests like audio or game assets
    if (event.request.url.includes('.mp3') || event.request.url.includes('.ogg')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    // Return the cached response if available
                    return cachedResponse;
                }
                return fetch(event.request).then((response) => {
                    // Cache the audio or media file dynamically if it's not cached
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            })
        );
    } else {
        // Handle other fetch requests (HTML, CSS, JS, etc.)
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
    }
});
