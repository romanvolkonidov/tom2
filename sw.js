// Service Worker for Ubora Services Limited website
const CACHE_NAME = 'ubora-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/performance.css',
  '/css/mobile.css',
  '/css/mobile-optimizations.css',
  '/css/fonts.css',
  '/js/script.js',
  '/images/1.webp',
  '/images/2.webp',
  '/images/1-mobile.webp',
  '/images/2-mobile.webp',
  '/manifest.json'
];

// Install event - cache key assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Check for mobile devices
  const isMobileRequest = event.request.headers.get('User-Agent').match(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  );
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request - request streams can only be consumed once
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response - response streams can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              // Only cache GET requests
              if (event.request.method === 'GET') {
                // Mobile-optimized caching strategy - prioritize mobile assets
                if (isMobileRequest && (
                    event.request.url.includes('mobile') || 
                    event.request.url.includes('css') || 
                    event.request.url.includes('js')
                )) {
                  // Higher priority for mobile-specific resources
                  cache.put(event.request, responseToCache);
                } else {
                  cache.put(event.request, responseToCache);
                }
              }
            });
            
          return response;
        });
      })
  );
});
