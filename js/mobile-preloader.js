// Mobile resource preloader for critical performance
(function() {
  'use strict';
  
  // Check if we're on mobile
  const isMobile = window.innerWidth <= 767;
  if (!isMobile) return;
  
  // Preload critical mobile resources
  const preloadResources = [
    { href: 'css/mobile-performance.css', as: 'style' },
    { href: 'images/1-mobile.webp', as: 'image' },
    { href: 'js/script.js', as: 'script' }
  ];
  
  preloadResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.as === 'image') {
      link.fetchpriority = 'high';
    }
    document.head.appendChild(link);
  });
  
  // Mobile-specific optimizations
  document.addEventListener('DOMContentLoaded', function() {
    // Add mobile-specific classes early
    document.documentElement.classList.add('mobile-optimized');
    
    // Optimize font loading on mobile
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    }
    
    // Mobile scroll performance
    let scrollTimer = null;
    const handleScroll = () => {
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
      scrollTimer = setTimeout(() => {
        // Scroll optimizations can go here
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Mobile touch optimizations
    document.addEventListener('touchstart', function() {
      // Add touch class for CSS optimizations
      document.documentElement.classList.add('touch-device');
    }, { passive: true, once: true });
  });
  
  // Connection-aware loading
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    if (connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' || 
        connection.saveData) {
      document.documentElement.classList.add('slow-connection');
      
      // Defer non-critical resources
      const deferredScripts = document.querySelectorAll('script[defer]');
      deferredScripts.forEach(script => {
        script.setAttribute('data-deferred', 'true');
      });
    }
  }
  
  // Memory-aware optimizations
  if ('deviceMemory' in navigator && navigator.deviceMemory < 4) {
    document.documentElement.classList.add('low-memory');
    
    // Reduce image quality for low memory devices
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src.includes('-mobile.webp')) {
        // Already optimized for mobile
        return;
      }
      
      // Replace with mobile-optimized version if available
      const mobileSrc = img.src.replace('.webp', '-mobile.webp');
      const testImg = new Image();
      testImg.onload = () => {
        img.src = mobileSrc;
      };
      testImg.src = mobileSrc;
    });
  }
})();
