/**
 * Simple counter animation for stats section
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all counter elements
    const counters = document.querySelectorAll('.counter-number');
    
    // Function to animate counters
    function animateCounters() {
        counters.forEach(counter => {
            // Get target number from data attribute
            const target = +counter.getAttribute('data-count');
            
            // Set starting value at 0
            counter.textContent = '0';
            
            // Calculate increment and duration based on target value
            const duration = 2000; // Animation will take 2 seconds
            const steps = 50; // Number of steps to take
            const increment = Math.ceil(target / steps);
            const stepTime = Math.floor(duration / steps);
            
            let current = 0;
            
            // Set up the counter animation
            const timer = setInterval(() => {
                current += increment;
                
                // If we've reached or exceeded target, set final value and stop
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = current;
                }
            }, stepTime);
        });
    }

    // Use Intersection Observer to trigger animation when counter section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Start animation when section becomes visible
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Find the stats counter section and observe it
    const statsSection = document.querySelector('.stats-counter');
    if (statsSection) {
        observer.observe(statsSection);
    }
});
