// Ubora Services Limited - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animation library
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Navbar active state on scroll
    const sections = document.querySelectorAll('section[id]');
    
    function navHighlighter() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector('.navbar-nav a[href*=' + sectionId + ']').classList.add('active');
            } else {
                document.querySelector('.navbar-nav a[href*=' + sectionId + ']').classList.remove('active');
            }
        });
    }
    
    window.addEventListener('scroll', navHighlighter);

    // Counter animation
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
                    setTimeout(animate, 15);
                } else {
                    counter.innerText = value;
                }
            }
            animate();
        });
    }

    // Start counters when they come into view
    const counterSection = document.querySelector('.stats-counter');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    if (counterSection) {
        counterObserver.observe(counterSection);
    }

    // Scroll animation for all elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(element => {
        fadeObserver.observe(element);
    });

    // Handle form submissions with validation
    const contactForm = document.getElementById('contactForm');
    const quoteForm = document.getElementById('quoteForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            if (validateForm(this)) {
                // Show success message (in a real app, you would send the form data to a server)
                showFormSuccessMessage(contactForm, 'Thank you for contacting us! We will get back to you soon.');
            }
        });
    }
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            if (validateForm(this)) {
                // Show success message (in a real app, you would send the form data to a server)
                showFormSuccessMessage(quoteForm, 'Thank you for requesting a quote! Our team will provide a detailed estimate within 24 hours.');
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

    // Add fade-in class to elements we want to animate on scroll
    document.querySelectorAll('.service-card, .why-us-card, .client-logo, .contact-info, .contact-form, .quote-card').forEach(el => {
        el.classList.add('fade-in');
    });

    // Sticky navbar with shadow on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initialize image lazy loading
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
});