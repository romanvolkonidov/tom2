// Service Worker for Ubora Services Limited website
const CACHE_NAME = 'ubora-cache-v4';
const STATIC_CACHE = 'static-v4';
const IMG_CACHE = 'images-v4';
const FONTS_CACHE = 'fonts-v4';
const DYNAMIC_CACHE = 'dynamic-v4';

// Assets to cache immediately
const staticAssets = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/fonts.css',
  '/js/script.js',
  '/manifest.json',
  '/offline.html'
];

// Font assets for optimized loading
const fontAssets = [
  'https://fonts.gstatic.com/s/montserrat/v15/JTURjIg1_i6t8kCHKm45_dJE3gnD_g.woff2'
];

// Image assets with device-specific versions
const imgAssets = {
  mobile: [
    '/images/1-mobile.webp',
    '/images/2-mobile.webp'
  ],
  desktop: [
    '/images/1.webp',
    '/images/2.webp',
    '/images/3.webp'
  ]
};

// CSS assets with conditional loading
const cssAssets = {
  core: [
    '/css/core-critical.css',
    '/css/mobile-performance.css'
  ],
  nonCritical: [
    '/css/performance.css',
    '/css/icon-fix.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
  ]
};

// JavaScript assets with priority levels
const jsAssets = {
  critical: [
    '/js/script.js'
  ],
  nonCritical: [
    '/js/form-handler.js',
    '/js/icon-fix.js',
    '/js/social-icon-fix.js'
  ]
};

// Helper functions
const isMobileDevice = () => /(android|iphone|ipod|ipad)/i.test(self.navigator?.userAgent || '');

const isSlowConnection = () => {
  const connection = self.navigator?.connection;
  return connection && (
    connection.saveData ||
    ['slow-2g', '2g', '3g'].includes(connection.effectiveType)
  );
};

// Cache management functions
async function addToCache(cacheName, assets) {
  const cache = await caches.open(cacheName);
  await cache.addAll(Array.isArray(assets) ? assets : [assets]);
}

async function deleteOldCaches() {
  const cacheKeepList = [CACHE_NAME, STATIC_CACHE, IMG_CACHE, FONTS_CACHE, DYNAMIC_CACHE];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter(key => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(key => caches.delete(key)));
}

// Install event - cache key assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      addToCache(STATIC_CACHE, staticAssets),
      
      // Cache fonts
      addToCache(FONTS_CACHE, fontAssets),
      
      // Cache device-specific images
      addToCache(IMG_CACHE, 
        isMobileDevice() 
          ? imgAssets.mobile
          : [...imgAssets.mobile, ...imgAssets.desktop]
      ),
      
      // Cache CSS based on criticality
      addToCache(STATIC_CACHE, [
        ...cssAssets.core,
        ...(isSlowConnection() ? [] : cssAssets.nonCritical)
      ])
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      deleteOldCaches(),
      self.clients.claim()
    ])
  );
});

// Fetch event with optimized strategies
self.addEventListener('fetch', event => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  const url = new URL(event.request.url);
  
  // Handle cross-origin requests
  if (url.origin !== self.location.origin) {
    // Handle CDN resources
    if (url.host.includes('cdn.jsdelivr.net') || 
        url.host.includes('fonts.googleapis.com') ||
        url.host.includes('fonts.gstatic.com') ||
        url.host.includes('unpkg.com')) {
      event.respondWith(handleCDNRequest(event.request));
      return;
    }
    return;
  }

  // Handle same-origin requests based on type
  if (event.request.headers.get('Accept')?.includes('text/html')) {
    // HTML - network-first
    event.respondWith(handleHTMLRequest(event.request));
  } else if (url.pathname.match(/\.(webp|png|jpg|jpeg|svg|gif)$/)) {
    // Images - cache-first
    event.respondWith(handleImageRequest(event.request));
  } else if (url.pathname.match(/\.(js|css)$/)) {
    // CSS/JS - stale-while-revalidate
    event.respondWith(handleAssetRequest(event.request));
  } else {
    // Everything else - network-first with fallback
    event.respondWith(handleOtherRequest(event.request));
  }
});

// Request handlers
async function handleHTMLRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('Network error:', error);
  }
  
  const cachedResponse = await caches.match(request);
  return cachedResponse || caches.match('/offline.html');
}

async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(IMG_CACHE);
      await cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('Image fetch error:', error);
  }
  
  return new Response('Image not available', { status: 404 });
}

async function handleAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  
  // Return cached response immediately
  if (cachedResponse) {
    // Revalidate in background
    revalidateCache(request);
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('Asset fetch error:', error);
  }
  
  return new Response('Asset not available', { status: 404 });
}

async function handleCDNRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      // Cache CDN resources for 1 week
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'public, max-age=604800');
      const cachedResponse = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
      await cache.put(request, cachedResponse);
      return response;
    }
  } catch (error) {
    console.log('CDN fetch error:', error);
  }
  
  return new Response('Resource not available', { status: 404 });
}

async function handleOtherRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('Resource fetch error:', error);
  }
  
  const cachedResponse = await caches.match(request);
  return cachedResponse || new Response('Resource not available', { status: 404 });
}

// Background cache revalidation
async function revalidateCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response);
    }
  } catch (error) {
    console.log('Cache revalidation failed:', error);
  }
}
