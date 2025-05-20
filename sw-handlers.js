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
