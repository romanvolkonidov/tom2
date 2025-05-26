// Performance monitoring for Ubora Services website
(function() {
    'use strict';
    
    // Track Core Web Vitals
    function trackWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
            
            // Send to analytics if needed
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                    name: 'LCP',
                    value: Math.round(lastEntry.startTime),
                    event_category: 'Performance'
                });
            }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                console.log('FID:', entry.processingStart - entry.startTime);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'web_vitals', {
                        name: 'FID',
                        value: Math.round(entry.processingStart - entry.startTime),
                        event_category: 'Performance'
                    });
                }
            }
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('CLS:', clsValue);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'web_vitals', {
                    name: 'CLS',
                    value: Math.round(clsValue * 1000),
                    event_category: 'Performance'
                });
            }
        }).observe({ entryTypes: ['layout-shift'] });
    }
    
    // Track page load performance
    function trackPageLoad() {
        window.addEventListener('load', function() {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            console.log('Performance Metrics:');
            console.log('DNS Lookup:', navigation.domainLookupEnd - navigation.domainLookupStart);
            console.log('TCP Connection:', navigation.connectEnd - navigation.connectStart);
            console.log('Response Time:', navigation.responseEnd - navigation.requestStart);
            console.log('DOM Processing:', navigation.domContentLoadedEventEnd - navigation.responseEnd);
            console.log('Full Page Load:', navigation.loadEventEnd - navigation.navigationStart);
            
            // Track resource loading
            const resources = performance.getEntriesByType('resource');
            const slowResources = resources.filter(r => r.duration > 1000);
            
            if (slowResources.length > 0) {
                console.warn('Slow loading resources:', slowResources);
            }
        });
    }
    
    // Monitor connection quality
    function trackConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            console.log('Connection Info:', {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            });
        }
    }
    
    // Initialize performance tracking
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            trackWebVitals();
            trackPageLoad();
            trackConnection();
        });
    } else {
        trackWebVitals();
        trackPageLoad();
        trackConnection();
    }
    
    // Performance recommendations based on device
    function optimizeForDevice() {
        const isMobile = window.innerWidth <= 767;
        const isLowEnd = navigator.deviceMemory && navigator.deviceMemory < 4;
        const isSlowConnection = navigator.connection && 
            (navigator.connection.saveData || 
             navigator.connection.effectiveType === '2g' || 
             navigator.connection.effectiveType === 'slow-2g');
        
        if (isMobile || isLowEnd || isSlowConnection) {
            // Disable non-essential animations
            const style = document.createElement('style');
            style.textContent = `
                .optimized-device * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
                .optimized-device .service-card:hover {
                    transform: none !important;
                }
            `;
            document.head.appendChild(style);
            document.documentElement.classList.add('optimized-device');
            
            console.log('Applied performance optimizations for low-end device/slow connection');
        }
    }
    
    optimizeForDevice();
})();
