// Ubora Services - Service Worker for mobile performance optimization

const CACHE_NAME = 'ubora-cache-v1';
const RUNTIME_CACHE = 'ubora-runtime-v1';

// Resources to precache - minimal set for fastest mobile loading
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/core-critical.css',
  '/css/mobile-performance.css',
  '/js/script.js',
  '/images/1-mobile.webp',
  '/images/1.webp',
  '/manifest.json'
];

// Install handler - cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate handler - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch handler - network first for API requests, cache first for assets
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For API/form requests, use network
  if (event.request.url.includes('sendcontactmessage') || 
      event.request.method !== 'GET') {
    return;
  }

  // For image requests, use cache-first strategy
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
    return;
  }

  // For HTML, use network-first strategy
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // For other assets, use stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        return caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Fallback for offline access
        if (event.request.destination === 'style' || 
            event.request.destination === 'script') {
          return new Response('/* Offline */');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'submit-form') {
    event.waitUntil(submitForms());
  }
});

// Helper function to submit forms when back online
async function submitForms() {
  try {
    const db = await openDatabase();
    const forms = await db.getAll('forms');
    
    for (const form of forms) {
      try {
        const response = await fetch(form.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form.data)
        });
        
        if (response.ok) {
          await db.delete('forms', form.id);
        }
      } catch (error) {
        console.error('Failed to submit form:', error);
      }
    }
  } catch (error) {
    console.error('Failed to process offline forms:', error);
  }
}

// Helper function to open the IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('UboraOfflineDB', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('forms')) {
        db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      resolve({
        getAll: (storeName) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        },
        delete: (storeName, id) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        }
      });
    };
    
    request.onerror = () => reject(request.error);
  });
}
