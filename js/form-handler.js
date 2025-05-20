// Form handling with PHP email handler integration
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const contactForm = document.getElementById('contactForm');
    const quoteForm = document.getElementById('quoteForm');
    
    // Contact form submission handler
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm(this)) {
                // Collect form data
                const formData = {
                    name: contactForm.querySelector('#name').value,
                    email: contactForm.querySelector('#email').value,
                    phone: contactForm.querySelector('#phone').value,
                    service: contactForm.querySelector('#service').value,
                    message: contactForm.querySelector('#message').value,
                    type: 'contact'
                };
                
                // Show loading indicator
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = 'Sending...';
                submitBtn.disabled = true;
                
                fetch('https://sendcontactmessage-35666ugduq-uc.a.run.app', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    showFormSuccessMessage(contactForm, 'Thank you for contacting us! We will get back to you soon.');
                    contactForm.reset();
                })
                .catch(error => {
                    showFormErrorMessage(contactForm, 'There was a problem sending your message. Please try again later.');
                    console.error('Error:', error);
                })
                .finally(() => {
                    // Restore button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
            }
        });
    }
    
    // Quote form submission handler
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm(this)) {
                // Collect form data
                const formData = {
                    name: quoteForm.querySelector('#quoteName').value,
                    email: quoteForm.querySelector('#quoteEmail').value,
                    phone: quoteForm.querySelector('#quotePhone').value,
                    location: quoteForm.querySelector('#quoteLocation').value,
                    service: quoteForm.querySelector('#quoteService').value,
                    message: quoteForm.querySelector('#quoteDetails').value,
                    type: 'quote'
                };
                
                // Show loading indicator
                const submitBtn = quoteForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
                submitBtn.disabled = true;
                
                // Send to cloud function
                fetch('https://sendcontactmessage-35666ugduq-uc.a.run.app', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    showFormSuccessMessage(quoteForm, 'Thank you for requesting a quote! Our team will provide a detailed estimate within 24 hours.');
                    quoteForm.reset();
                })
                .catch(error => {
                    showFormErrorMessage(quoteForm, 'There was a problem sending your request. Please try again later.');
                    console.error('Error:', error);
                })
                .finally(() => {
                    // Restore button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
            }
        });
    }
    
    // Form validation function
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
    
    // Show success message
    function showFormSuccessMessage(form, message) {
        // Remove any existing alerts
        const existingAlerts = form.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create and show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success mt-3';
        successDiv.innerText = message;
        
        form.appendChild(successDiv);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
    
    // Show error message
    function showFormErrorMessage(form, message) {
        // Remove any existing alerts
        const existingAlerts = form.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
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
});
