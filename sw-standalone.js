// File: sw-standalone.js
// Complete service worker for Ubora Services website
// This is a standalone version that doesn't require importing sw-handlers.js

// Cache names with versioning
const CACHE_NAME = 'ubora-cache-v2';
const STATIC_CACHE = 'ubora-static-v2';
const IMAGES_CACHE = 'ubora-images-v2';
const FONTS_CACHE = 'ubora-fonts-v2';

// Assets to cache immediately on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/mobile.css',
  '/js/script.js',
  '/images/1-mobile.webp',
  '/images/2-mobile.webp',
  '/manifest.json'
];

// Additional assets to cache on first use
const SECONDARY_ASSETS = [
  '/css/performance.css',
  '/css/mobile-optimizations.css',
  '/css/fonts.css',
  '/css/low-end-devices.css',
  '/css/icon-fix.css',
  '/images/1.webp',
  '/images/2.webp',
  '/js/form-handler.js',
  '/js/icon-fix.js',
  '/js/social-icon-fix.js'
];

// External resources to cache
const EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.js',
  'https://unpkg.com/aos@2.3.1/dist/aos.css'
];

// Install event - cache key assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Core assets cache
      caches.open(STATIC_CACHE).then(cache => cache.addAll(CORE_ASSETS)),
      
      // Pre-cache external assets with lower priority
      caches.open(STATIC_CACHE).then(cache => {
        // Don't wait for these to complete before activating
        cache.addAll(EXTERNAL_ASSETS).catch(() => console.log('Failed to cache some external assets'));
      })
    ])
    .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old versions of our caches
          if (
            cacheName !== STATIC_CACHE && 
            cacheName !== IMAGES_CACHE && 
            cacheName !== FONTS_CACHE &&
            cacheName.startsWith('ubora-')
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of uncontrolled clients
  );
});

// Helper function to determine if request is for an image
function isImageRequest(url) {
  return url.match(/\.(jpe?g|png|gif|webp|svg|ico)$/i);
}

// Helper function to determine if request is for a font
function isFontRequest(url) {
  return url.match(/\.(woff2?|ttf|otf|eot)$/i) || url.includes('fonts.googleapis.com');
}

// Fetch event with improved caching strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Check for mobile devices
  const isMobileRequest = event.request.headers.get('User-Agent')?.match(
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  ) || false;
  
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Don't cache API calls or external resources we don't explicitly want to cache
  if (url.pathname.startsWith('/api/') || url.pathname.includes('analytics')) {
    return;
  }
  
  // Different strategy for different asset types
  if (isImageRequest(url.pathname)) {
    // Images: Cache first, network as fallback, update cache
    event.respondWith(handleImageRequest(event.request, isMobileRequest));
  } else if (isFontRequest(url.href)) {
    // Fonts: Cache first, network as fallback
    event.respondWith(handleFontRequest(event.request));
  } else if (url.pathname === '/' || url.pathname === '/index.html') {
    // HTML: Network first, cache as fallback
    event.respondWith(handleHTMLRequest(event.request));
  } else {
    // Everything else: Stale-while-revalidate
    event.respondWith(handleAssetRequest(event.request));
  }
});

// Handle image requests
async function handleImageRequest(request, isMobile) {
  const cacheResponse = await caches.match(request);
  if (cacheResponse) return cacheResponse;
  
  try {
    const networkResponse = await fetch(request);
    const clonedResponse = networkResponse.clone();
    
    // Store in cache for future use
    caches.open(IMAGES_CACHE).then(cache => {
      // Prioritize mobile images
      if (isMobile && (request.url.includes('mobile') || request.url.includes('-mobile'))) {
        // Store with higher priority for mobile assets
        cache.put(request, clonedResponse);
      } else {
        cache.put(request, clonedResponse);
      }
    });
    
    return networkResponse;
  } catch (error) {
    // If network fails, return nothing - there's no fallback for images
    console.error('Failed to fetch image:', error);
    return new Response('Image not available', { status: 503 });
  }
}

// Handle HTML requests
async function handleHTMLRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    const clonedResponse = networkResponse.clone();
    
    // Store in cache
    caches.open(STATIC_CACHE).then(cache => {
      cache.put(request, clonedResponse);
    });
    
    return networkResponse;
  } catch (error) {
    // If network fails, use cache
    const cacheResponse = await caches.match(request);
    if (cacheResponse) return cacheResponse;
    
    // If no cache, return a basic offline page
    return new Response(
      '<html><body><h1>Temporarily Offline</h1><p>Please check your connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Handle font requests
async function handleFontRequest(request) {
  const cacheResponse = await caches.match(request);
  if (cacheResponse) return cacheResponse;
  
  try {
    const networkResponse = await fetch(request);
    const clonedResponse = networkResponse.clone();
    
    // Store in font cache
    caches.open(FONTS_CACHE).then(cache => {
      cache.put(request, clonedResponse);
    });
    
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch font:', error);
    return new Response('Font not available', { status: 503 });
  }
}

// Handle general asset requests (CSS, JS, etc)
async function handleAssetRequest(request) {
  const cacheResponse = await caches.match(request);
  
  // Clone the request as it can only be used once
  const fetchPromise = fetch(request).then(networkResponse => {
    // Check valid response
    if (!networkResponse || networkResponse.status !== 200) {
      return networkResponse;
    }
    
    const clonedResponse = networkResponse.clone();
    
    // Update the cache with the new response
    caches.open(STATIC_CACHE).then(cache => {
      cache.put(request, clonedResponse);
    });
    
    return networkResponse;
  }).catch(error => {
    console.error('Failed to fetch asset:', request.url, error);
    // No fallback if both cache and network fail
  });
  
  // Return cached response immediately if we have it, otherwise wait for network
  return cacheResponse || fetchPromise;
}
