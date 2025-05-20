// Ubora Services Limited - Main JavaScript

// Register Service Worker for PWA capabilities and caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }, 3000); // Delay registration to improve initial load performance
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
    supportsIdleCallback: 'requestIdleCallback' in window,
    
    // Add SEO-friendly image handling
    optimizeImagesForSEO: (img) => {
        // Ensure all images have proper alt text for SEO
        if (!img.alt || img.alt === '') {
            // Generate descriptive alt text based on context
            const context = img.closest('section')?.id || '';
            if (context === 'hero') {
                img.alt = 'Ubora Services Professional Cleaning Team in Kenya';
            } else if (context === 'services') {
                img.alt = 'Professional Services by Ubora in Western Kenya';
            } else if (context === 'about') {
                img.alt = 'Ubora Services Team at Work in Kisumu, Kenya';
            } else if (context === 'clients') {
                img.alt = 'Clients of Ubora Services in Kenya';
            } else {
                img.alt = 'Ubora Professional Services in Western Kenya';
            }
        }
        
        // Add title attribute for additional SEO benefit if not present
        if (!img.title) {
            img.title = img.alt;
        }
        
        // Add loading attribute if not present
        if (!img.loading) {
            img.loading = img.closest('#hero') ? 'eager' : 'lazy';
        }
        
        return img;
    }
};

// Optimized initialization with requestIdleCallback
const initializeApp = () => {
    // Set performance classes immediately
    const classList = document.documentElement.classList;
    if (perf.isMobile) classList.add('mobile-device');
    if (perf.isLowEndDevice) classList.add('low-end-device');
    if (perf.hasSlowConnection()) classList.add('slow-connection');
    
    // Mobile-specific optimizations - apply immediately for better performance
    if (perf.isMobile) {
        // Disable all animations and transitions
        document.body.classList.add('no-animation');
        
        // Set image loading to eager for above-fold images, lazy for others
        const aboveFoldImages = document.querySelectorAll('#hero img');
        aboveFoldImages.forEach(img => {
            img.loading = 'eager';
            img.decoding = 'async';
        });
    }
    
    // Queue less critical initializations in idle callback or setTimeout
    const queueInitialization = (callback) => {
        if (perf.supportsIdleCallback) {
            requestIdleCallback(callback, { timeout: 2000 });
        } else {
            setTimeout(callback, 100);
        }
    };
    
    // Optimize image loading with native lazy loading and data URIs
    const optimizeImages = () => {
        const images = document.querySelectorAll('img:not([loading])');
        if (images.length === 0) return;
        
        const processImage = (img) => {
            img.loading = 'lazy';
            img.decoding = 'async';
            
            // SEO optimization for images
            perf.optimizeImagesForSEO(img);
            
            // Create placeholder for non-hero images only
            if (!img.closest('#hero') && !img.parentElement.classList.contains('img-placeholder')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'img-placeholder';
                img.parentNode.insertBefore(placeholder, img);
                placeholder.appendChild(img);
            }
        };

        // Process images in chunks, prioritizing visible ones
        const processChunk = (i) => {
            const chunk = Array.from(images).slice(i, i + 3); // Reduce chunk size for mobile
            chunk.forEach(processImage);
            if (i + 3 < images.length) {
                (perf.supportsIdleCallback ? requestIdleCallback : setTimeout)(() => processChunk(i + 3), { timeout: 500 });
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
                    
                    // On mobile, limit resource loading for better performance
                    if (!perf.isMobile || entry.target.id === 'hero' || entry.target.id === 'services') {
                        // Load section-specific resources
                        queueInitialization(() => loadSectionResources(entry.target));
                    } else {
                        // For non-critical sections on mobile, delay loading even more
                        setTimeout(() => loadSectionResources(entry.target), 1000);
                    }
                }
            });
        };

        // More aggressive thresholds for mobile
        const observer = new IntersectionObserver(observerCallback, {
            rootMargin: perf.isMobile ? '10px' : '50px',
            threshold: perf.isMobile ? 0.05 : 0.2
        });

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

        // Load section-specific scripts - only if required
        if (!perf.isMobile) {
            section.querySelectorAll('script[data-src]').forEach(script => {
                const newScript = document.createElement('script');
                newScript.src = script.dataset.src;
                newScript.async = true;
                script.parentNode.replaceChild(newScript, script);
            });
        }
    };

    // Initialize optimizations based on device capabilities
    const initialize = () => {
        // First-priority optimization
        optimizeImages();
        
        // Second-priority optimization
        queueInitialization(initializeSections);

        // Only for high-end devices - AOS initialization
        if (!perf.isMobile && !perf.isLowEndDevice && !perf.prefersReducedMotion && typeof AOS !== 'undefined') {
            queueInitialization(() => {
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
            });
        }
    };

    // Smooth scrolling for all anchor links with performance optimizations
    // Use passive event listeners for better scroll performance
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
                
                // Simplified scrolling for mobile
                if (perf.isMobile) {
                    window.scrollTo(0, offsetPosition);
                } else {
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        }, { passive: false });
    });

    // Use IntersectionObserver for navbar active state rather than scroll events
    // Only initialize if not on a low-end device
    if (!perf.isLowEndDevice) {
        queueInitialization(() => {
            const navLinks = document.querySelectorAll('.navbar-nav a');
            const sections = document.querySelectorAll('section[id]');
            
            // Create the observer with appropriate options
            const navObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        
                        // Update the active state in the navbar
                        requestAnimationFrame(() => {
                            navLinks.forEach(link => {
                                link.classList.remove('active');
                                if (link.getAttribute('href') === '#' + id) {
                                    link.classList.add('active');
                                }
                            });
                        });
                        
                        // SEO enhancement: Update page title and description based on visible section
                        // This helps search engines better understand the content when specific sections are shared
                        if (id) {
                            updateMetadataForSection(id);
                        }
                    }
                });
            }, { rootMargin: "-30% 0px -70% 0px" });
            
            // Observe each section
            sections.forEach(section => {
                navObserver.observe(section);
            });
            
            // SEO enhancement: Function to update metadata based on visible section
            function updateMetadataForSection(sectionId) {
                let newTitle = document.title;
                let newDescription = document.querySelector('meta[name="description"]').getAttribute('content');
                
                // Store original values if we haven't yet
                if (!window.originalMetadata) {
                    window.originalMetadata = {
                        title: document.title,
                        description: newDescription
                    };
                }
                
                // Update metadata based on section
                switch(sectionId) {
                    case 'services':
                        newTitle = 'Professional Services in Western Kenya | Ubora Services';
                        newDescription = 'Our professional services include cleaning, fumigation, waste collection, errand services, electrical & solar solutions, and building services across Western Kenya.';
                        break;
                    case 'cleaning-services':
                        newTitle = 'Professional Cleaning Services in Kenya | Ubora Services';
                        newDescription = 'Expert cleaning services for commercial facilities, offices and homes with meticulous attention to detail throughout Kisumu and Western Kenya.';
                        break;
                    case 'fumigation-services':
                        newTitle = 'Licensed Fumigation Services in Kenya | Ubora Services';
                        newDescription = 'PCPB-certified fumigation services against flying and crawling pests by trained professionals across Western Kenya.';
                        break;
                    case 'waste-collection':
                        newTitle = 'NEMA-Licensed Waste Collection in Kenya | Ubora Services';
                        newDescription = 'Professional collection of general garbage, hazardous waste, biomedical waste, and sewage across Western Kenya counties.';
                        break;
                    case 'about':
                        newTitle = 'About Ubora Services | Professional Services Since 2014';
                        newDescription = 'Trusted service provider established in 2014, offering a variety of professional services with certified staff across 14 counties in Western Kenya.';
                        break;
                    case 'contact':
                        newTitle = 'Contact Ubora Services | Professional Services in Kenya';
                        newDescription = 'Get in touch with Ubora Services for professional cleaning, fumigation, waste collection and other services in Kisumu and Western Kenya.';
                        break;
                    case 'quote':
                        newTitle = 'Request a Quote | Ubora Professional Services in Kenya';
                        newDescription = 'Request a customized quote for our professional cleaning, fumigation, waste collection and general services across Western Kenya.';
                        break;
                    default:
                        // Reset to original values for home or unlisted sections
                        if (window.originalMetadata) {
                            newTitle = window.originalMetadata.title;
                            newDescription = window.originalMetadata.description;
                        }
                }
                
                // Update the document title and description
                document.title = newTitle;
                document.querySelector('meta[name="description"]').setAttribute('content', newDescription);
                
                // If this browser supports the History API, update the URL fragment without reload
                // This allows search engines to index each section as if it were a separate page
                if (history.replaceState && sectionId !== 'hero') {
                    const newUrl = window.location.pathname + '#' + sectionId;
                    history.replaceState(null, newTitle, newUrl);
                }
            }
        });
    }

    // Optimized Counter animation - only initialize when visible and if not on a low-end device
    if (!perf.isLowEndDevice && !perf.isMobile) {
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
    } else if (perf.isMobile) {
        // For mobile/low-end, just set the counter values immediately
        document.querySelectorAll('.counter-number').forEach(counter => {
            const value = counter.getAttribute('data-count');
            counter.innerText = value;
        });
    }

    // Initialize only critical functionality for first paint
    initialize();
    
    // Handle other initializations after first contentful paint
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // Register these event handlers only after the page has loaded
            initializeEventHandlers();
        }, { timeout: 2000 });
    } else {
        setTimeout(initializeEventHandlers, 1000);
    }
};

// Separate function for event handlers to delay their initialization
function initializeEventHandlers() {
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
    
    function showFormErrorMessage(form, message) {
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.innerText = message;
        
        form.appendChild(errorDiv);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize the app when document is ready or after first paint
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // If DOMContentLoaded already fired, initialize immediately
    initializeApp();
}

// Export performance utilities if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { perf };
}