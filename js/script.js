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

// Detect mobile devices
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Add performance optimizations for mobile
    if (isMobile) {
        // Disable hover effects on mobile for better performance
        document.documentElement.classList.add('mobile-device');
        
        // Optimize image loading on mobile
        const deferredImages = document.querySelectorAll('img[loading="lazy"]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        lazyImage.loading = 'eager';
                        imageObserver.unobserve(lazyImage);
                    }
                });
            });
            
            deferredImages.forEach(image => {
                imageObserver.observe(image);
            });
        }
    }
    // Initialize AOS animation library with performance optimizations
    if (typeof AOS !== 'undefined') {
        // Use a small timeout to ensure non-blocking
        setTimeout(() => {
            AOS.init({
                duration: isMobile ? 400 : 800,
                easing: 'ease-in-out',
                once: true,
                mirror: false,
                disable: isMobile ? 'phone' : false, // Disable on small mobile devices
                offset: isMobile ? 20 : 50 // Smaller offset on mobile
            });
        }, 100);
    }

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

    // Use IntersectionObserver for fade-in animations instead of classes
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve after animation to save resources
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "50px" });
    
    document.querySelectorAll('.service-card, .why-us-card, .client-logo, .contact-info, .contact-form, .quote-card').forEach(el => {
        el.classList.add('fade-in');
        fadeObserver.observe(el);
    });

    // Optimize navbar scroll detection with throttling
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    // Throttle scroll event for better performance
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            if (!inThrottle) {
                func.apply(this, arguments);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    window.addEventListener('scroll', throttle(function() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    }, 100));

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
});