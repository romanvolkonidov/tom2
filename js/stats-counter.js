// Fixed Stats Counter Implementation
document.addEventListener('DOMContentLoaded', function() {
    let counterAnimated = false;

    // Optimized Counter animation using IntersectionObserver
    const startCounters = () => {
        if (counterAnimated) return; // Prevent multiple animations
        
        const counters = document.querySelectorAll('.counter-number');
        const speed = 150; // Faster animation for better UX
        
        counters.forEach(counter => {
            const targetValue = parseInt(counter.getAttribute('data-count'));
            let currentValue = 0;
            const increment = targetValue / speed;
            
            const animate = () => {
                currentValue += increment;
                if (currentValue < targetValue) {
                    counter.innerText = Math.ceil(currentValue);
                    requestAnimationFrame(animate);
                } else {
                    counter.innerText = targetValue; // Ensure we hit the exact target
                }
            };
            
            // Start animation
            requestAnimationFrame(animate);
        });
        
        counterAnimated = true;
    };

    // Use IntersectionObserver for counter animation
    const counterSection = document.querySelector('.stats-counter');
    
    if (counterSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counterAnimated) {
                    startCounters();
                    counterObserver.unobserve(entry.target); // Stop observing after animation
                }
            });
        }, { 
            threshold: 0.3, // Trigger when 30% visible
            rootMargin: '0px 0px -50px 0px' // Add some margin for better trigger timing
        });
        
        counterObserver.observe(counterSection);
    }
});
