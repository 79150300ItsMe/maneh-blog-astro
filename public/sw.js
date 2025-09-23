// Enhanced Service Worker for Maneh Blog
'use strict';

const CACHE_NAME = 'maneh-blog-v1.4';
const RUNTIME_CACHE = 'maneh-runtime-v1.4';

// Resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/css/style.css',
  '/js/script.js',
  '/js/data.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/dompurify@3.0.11/dist/purify.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:wght@700;800&display=swap'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static resources...');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch(error => console.error('Cache installation failed:', error))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE
            )
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
      .catch(error => console.error('Cache cleanup failed:', error))
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) URLs
  if (!request.url.startsWith('http')) return;

  // Skip API calls, video proxy, article URLs, ads.txt, and external images
  if (url.pathname.startsWith('/v/') || 
      url.pathname.startsWith('/api/') ||
      url.pathname.match(/^\/\d{4}\/\d{2}\/\d{2}\/\d+-/) ||
      url.pathname === '/ads.txt' ||
      url.hostname === 'images.unsplash.com' ||
      url.hostname === 'www.googletagmanager.com') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache and update in background
          updateCacheInBackground(request);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetchAndCache(request);
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        // Return offline fallback for HTML requests
        if (request.destination === 'document') {
          return caches.match('/');
        }
        throw error;
      })
  );
});

// Helper function to fetch and cache
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      // Clone response before caching
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Network fetch failed:', error);
    throw error;
  }
}

// Helper function to update cache in background
function updateCacheInBackground(request) {
  fetch(request)
    .then(response => {
      if (response.ok) {
        return caches.open(RUNTIME_CACHE)
          .then(cache => cache.put(request, response));
      }
    })
    .catch(error => console.log('Background update failed:', error));
}

// Handle push notifications (if needed in future)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Maneh Blog', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // Check if window is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker loaded successfully!');
