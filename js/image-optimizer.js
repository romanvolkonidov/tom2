// WebP and Image Optimization for Ubora Services
(function() {
    'use strict';
    
    // Check WebP support
    function supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    // Connection-aware image loading
    function getConnectionSpeed() {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                if (connection.effectiveType) {
                    return connection.effectiveType;
                }
                if (connection.downlink) {
                    return connection.downlink > 1.5 ? 'fast' : 'slow';
                }
            }
        }
        return 'unknown';
    }
    
    // Optimize images based on device and connection
    function optimizeImages() {
        const images = document.querySelectorAll('img[data-src], img[src]');
        const isWebPSupported = supportsWebP();
        const connectionSpeed = getConnectionSpeed();
        const isSlowConnection = connectionSpeed === 'slow' || connectionSpeed === '2g' || connectionSpeed === 'slow-2g';
        
        images.forEach(img => {
            // Skip if already optimized
            if (img.dataset.optimized) return;
            
            let src = img.dataset.src || img.src;
            
            // Replace with WebP if supported and original is jpg/png
            if (isWebPSupported && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png'))) {
                src = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            }
            
            // Use smaller images for slow connections
            if (isSlowConnection) {
                // Implement responsive images based on viewport
                const viewportWidth = window.innerWidth;
                if (viewportWidth <= 768) {
                    src = src.replace(/(\.[^.]+)$/, '-mobile$1');
                } else if (viewportWidth <= 1200) {
                    src = src.replace(/(\.[^.]+)$/, '-tablet$1');
                }
            }
            
            // Set optimized source
            if (img.dataset.src) {
                img.dataset.src = src;
            } else {
                img.src = src;
            }
            
            // Add loading optimization attributes
            img.decoding = 'async';
            img.dataset.optimized = 'true';
            
            // Add error handling for fallback
            img.onerror = function() {
                if (this.src.includes('.webp')) {
                    this.src = this.src.replace('.webp', '.jpg');
                }
            };
        });
    }
    
    // Run optimization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', optimizeImages);
    } else {
        optimizeImages();
    }
    
    // Re-optimize new images added dynamically
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    if (node.tagName === 'IMG') {
                        optimizeImages();
                    } else if (node.querySelectorAll) {
                        const imgs = node.querySelectorAll('img');
                        if (imgs.length > 0) {
                            optimizeImages();
                        }
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
})();
