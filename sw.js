// Service Worker for Ubora Services Limited website
const CACHE_NAME = 'ubora-cache-v3'; // Incremented cache version for new optimized files
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.min.css', // Using minified CSS
  '/css/critical-inline.css', // Critical CSS
  '/css/mobile-performance.css',
  '/css/low-end-devices.css',
  '/js/script.min.js', // Using minified JS
  '/js/stats-counter.js', // Stats counter script
  '/js/form-handler.js',
  '/js/image-optimizer.js',
  '/js/performance-monitor.js',
  '/images/1.webp',
  '/images/2.webp',
  '/images/1-mobile.webp',
  '/images/2-mobile.webp',
  '/sitemap.xml',
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

// Enhanced fetch event with optimized strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isMobileRequest = event.request.headers.get('User-Agent') && 
                          event.request.headers.get('User-Agent').match(
                            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
                          );
  
  // HTML navigation - network first for latest content
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept') && 
       event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Update the cache with the latest version
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request) || caches.match('/index.html');
        })
    );
    return;
  }
  
  // Stats counter script - network first to ensure latest version
  if (event.request.url.includes('stats-counter.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Cache first for static assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Clone the request before fetching
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check for valid response
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone response before caching
          const responseToCache = response.clone();
          
          // Cache based on device type and content type
          caches.open(CACHE_NAME).then(cache => {
            if (event.request.method === 'GET') {
              // Prioritize mobile assets for mobile devices
              if (isMobileRequest && (
                  url.pathname.includes('mobile') || 
                  url.pathname.endsWith('.css') || 
                  url.pathname.endsWith('.js')
              )) {
                cache.put(event.request, responseToCache);
              } else {
                cache.put(event.request, responseToCache);
              }
            }
          });
          
          return response;
        }).catch(error => {
          // Provide fallback for images if needed
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            return caches.match('/images/placeholder.webp');
          }
          throw error;
        });
      })
  );
});
