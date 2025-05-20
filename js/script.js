// Ubora Services Limited - Main JavaScript

// Register Service Worker for PWA capabilities and caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Performance optimization utilities
const perf = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isLowEndDevice: navigator.deviceMemory < 4 || !navigator.deviceMemory,
    hasSlowConnection: () => {
        const conn = navigator.connection;
        return conn && (conn.saveData || ['slow-2g', '2g', '3g'].includes(conn.effectiveType));
    },
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsIdleCallback: 'requestIdleCallback' in window
};

// Optimized initialization with requestIdleCallback
const initializeApp = () => {
    // Set performance classes
    const classList = document.documentElement.classList;
    if (perf.isMobile) classList.add('mobile-device');
    if (perf.isLowEndDevice) classList.add('low-end-device');
    if (perf.hasSlowConnection()) classList.add('slow-connection');
    
    // Optimize image loading with native lazy loading and data URIs
    const optimizeImages = () => {
        const images = document.querySelectorAll('img:not([loading])');
        if (images.length === 0) return;
        
        const processImage = (img) => {
            img.loading = 'lazy';
            img.decoding = 'async';
            
            // Create placeholder
            if (!img.parentElement.classList.contains('img-placeholder')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'img-placeholder';
                img.parentNode.insertBefore(placeholder, img);
                placeholder.appendChild(img);
            }
        };

        // Process images in chunks
        const processChunk = (i) => {
            const chunk = Array.from(images).slice(i, i + 5);
            chunk.forEach(processImage);
            if (i + 5 < images.length) {
                (perf.supportsIdleCallback ? requestIdleCallback : setTimeout)(() => processChunk(i + 5));
            }
        };
        
        processChunk(0);
    };

    // Optimized section loading with IntersectionObserver
    const initializeSections = () => {
        if (!perf.supportsIntersectionObserver) return;

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-viewport');
                    observer.unobserve(entry.target);
                    
                    // Load section-specific resources
                    loadSectionResources(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            rootMargin: '50px',
            threshold: perf.isMobile ? 0.1 : 0.2        });

        // Initialize section observers
        const sections = document.querySelectorAll('section');
        sections.forEach(section => observer.observe(section));
    };

    // Resource loading optimization
    const loadSectionResources = (section) => {
        // Load section-specific images
        section.querySelectorAll('img[data-src]').forEach(img => {
            if (perf.hasSlowConnection()) {
                // Load low-quality image for slow connections
                img.src = img.dataset.lowSrc || img.dataset.src;
            } else {
                img.src = img.dataset.src;
            }
            img.removeAttribute('data-src');
        });

        // Load section-specific scripts
        section.querySelectorAll('script[data-src]').forEach(script => {
            const newScript = document.createElement('script');
            newScript.src = script.dataset.src;
            newScript.async = true;
            script.parentNode.replaceChild(newScript, script);
        });
    };

    // Initialize optimizations based on device capabilities
    const initialize = () => {
        optimizeImages();
        initializeSections();

        // Conditional AOS initialization only for high-end devices
        if (!perf.isMobile && !perf.isLowEndDevice && !perf.prefersReducedMotion && typeof AOS !== 'undefined') {
            requestAnimationFrame(() => {
                AOS.init({
                    duration: 400,
                    easing: 'ease-out',
                    once: true,
                    mirror: false,
                    disable: perf.isMobile ? 'phone' : false,
                    offset: perf.isMobile ? 20 : 50
                });
            });
        }
    };

    // Smooth scrolling for all anchor links with performance optimizations
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Skip if href is just "#"
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Ensure Home link scrolls to hero section
    // This is already set in the HTML: <a class="nav-link active" href="#hero">Home</a>
    // But ensure smooth scroll and offset for fixed header

    document.addEventListener('DOMContentLoaded', function() {
      const homeLink = document.querySelector('.navbar-nav .nav-link[href="#hero"]');
      if (homeLink) {
        homeLink.addEventListener('click', function(e) {
          e.preventDefault();
          const hero = document.getElementById('hero');
          if (hero) {
            const headerOffset = 80;
            const elementPosition = hero.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      }
    });

    // Use IntersectionObserver for navbar active state rather than scroll events
    const navLinks = document.querySelectorAll('.navbar-nav a');
    const sections = document.querySelectorAll('section[id]');
    
    // Create the observer with appropriate options
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: "-30% 0px -70% 0px" });
    
    // Observe each section
    sections.forEach(section => {
        navObserver.observe(section);
    });

    // Optimized Counter animation using IntersectionObserver
    const startCounters = () => {
        const counters = document.querySelectorAll('.counter-number');
        const speed = 200;
        
        counters.forEach(counter => {
            const animate = () => {
                const value = +counter.getAttribute('data-count');
                const data = +counter.innerText;
                
                const time = value / speed;
                if (data < value) {
                    counter.innerText = Math.ceil(data + time);
                    // Use requestAnimationFrame for smoother animations
                    requestAnimationFrame(animate);
                } else {
                    counter.innerText = value;
                }
            }
            requestAnimationFrame(animate);
        });
    }

    // Use IntersectionObserver for counter animation
    const counterSection = document.querySelector('.stats-counter');
    
    if (counterSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counterObserver.observe(counterSection);
    }

    // Handle form submissions with validation
    const contactForm = document.getElementById('contactForm');
    const quoteForm = document.getElementById('quoteForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Basic validation
            if (validateForm(this)) {
                try {
                    const formData = {
                        type: 'contact',
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        service: document.getElementById('service').value,
                        message: document.getElementById('message').value
                    };

                    const response = await fetch('https://sendcontactmessage-35666ugduq-uc.a.run.app', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    // Show success message
                    showFormSuccessMessage(contactForm, 'Thank you for contacting us! We will get back to you soon.');
                } catch (error) {
                    console.error('Error:', error);
                    showFormErrorMessage(contactForm, 'Sorry, there was an error sending your message. Please try again.');
                }
            }
        });
    }
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Basic validation
            if (validateForm(this)) {
                try {
                    const formData = {
                        type: 'quote',
                        quoteName: document.getElementById('quoteName').value,
                        quoteEmail: document.getElementById('quoteEmail').value,
                        quotePhone: document.getElementById('quotePhone').value,
                        quoteLocation: document.getElementById('quoteLocation').value,
                        quoteService: document.getElementById('quoteService').value,
                        quoteDetails: document.getElementById('quoteDetails').value
                    };

                    const response = await fetch('https://sendcontactmessage-35666ugduq-uc.a.run.app', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    // Show success message
                    showFormSuccessMessage(quoteForm, 'Thank you for requesting a quote! Our team will provide a detailed estimate within 24 hours.');
                } catch (error) {
                    console.error('Error:', error);
                    showFormErrorMessage(quoteForm, 'Sorry, there was an error sending your quote request. Please try again.');
                }
            }
        });
    }
    
    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
            
            // Check email format
            if (input.type === 'email' && input.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(input.value)) {
                    isValid = false;
                    input.classList.add('is-invalid');
                }
            }
            
            // Check phone format (simple validation)
            if (input.id.includes('Phone') && input.value.trim()) {
                const phonePattern = /^[\d\s\+\-\(\)]{10,15}$/;
                if (!phonePattern.test(input.value)) {
                    isValid = false;
                    input.classList.add('is-invalid');
                }
            }
        });
        
        return isValid;
    }
    
    function showFormSuccessMessage(form, message) {
        // Create and show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success mt-3';
        successDiv.innerText = message;
        
        form.appendChild(successDiv);
        
        // Reset form
        form.reset();
        
        // Remove message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    // Memory-efficient fade-in animations with intersection observer and requestAnimationFrame
    const fadeElements = new Set();
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                fadeElements.add(element);
                
                requestAnimationFrame(() => {
                    element.classList.add('visible');
                    fadeElements.delete(element);
                    fadeObserver.unobserve(element);
                });
            }
        });
    }, { 
        threshold: perf.isMobile ? 0.1 : 0.2,
        rootMargin: perf.isMobile ? "20px" : "50px" 
    });
    
    // Batch DOM operations for better performance
    const elementsToFade = document.querySelectorAll(
        '.service-card, .why-us-card, .client-logo, .contact-info, .contact-form, .quote-card'
    );
    
    if (elementsToFade.length > 0) {
        const processFadeElements = (startIndex) => {
            const endIndex = Math.min(startIndex + 5, elementsToFade.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const el = elementsToFade[i];
                el.classList.add('fade-in');
                fadeObserver.observe(el);
            }
            
            if (endIndex < elementsToFade.length) {
                (perf.supportsIdleCallback ? requestIdleCallback : setTimeout)(() => {
                    processFadeElements(endIndex);
                });
            }
        };
        
        processFadeElements(0);
    }

    // Optimize scroll performance with IntersectionObserver and requestAnimationFrame
    const initScrollHandling = () => {
        const navbar = document.querySelector('.navbar');
        const navObserver = new IntersectionObserver(
            ([entry]) => {
                requestAnimationFrame(() => {
                    navbar.classList.toggle('scrolled', !entry.isIntersecting);
                });
            }, {
                threshold: 0,
                rootMargin: '-100px 0px 0px 0px'
            }
        );

        // Observe a sentinel element at the top of the page
        const sentinel = document.createElement('div');
        sentinel.style.cssText = 'position: absolute; top: 0; height: 1px; width: 100%; pointer-events: none;';
        document.body.prepend(sentinel);
        navObserver.observe(sentinel);

        // Optimize scroll-linked animations
        const scrollAnimations = new Map();
        let ticking = false;

        const updateScrollAnimations = () => {
            const scrollTop = window.scrollY;
            
            scrollAnimations.forEach((handler, element) => {
                if (!element.isConnected) {
                    scrollAnimations.delete(element);
                    return;
                }
                handler(scrollTop);
            });
            
            ticking = false;
        };

        // Add scroll handlers with RAF
        const addScrollHandler = (element, handler) => {
            scrollAnimations.set(element, handler);
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        };

        // Passive scroll listener
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        }, { passive: true });

        return { addScrollHandler };
    };

    // Initialize scroll handling
    const scrollHandler = initScrollHandling();

    // Native lazy loading for images
    if ('loading' in HTMLImageElement.prototype) {
        // Use native lazy loading
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            // Make sure all lazy images have src set
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        // Use IntersectionObserver instead of external library
        const lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    if (lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                    }
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            lazyImageObserver.observe(img);
        });
    }

    // Run initialization
    initialize();
};

// Initialize the app when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export performance utilities if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { perf };
}