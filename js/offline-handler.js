// Offline detection and handling for Ubora Services
(function() {
  'use strict';
  
  // Create an offline message element
  function createOfflineMessage() {
    const message = document.createElement('div');
    message.className = 'offline-message';
    message.innerHTML = `
      <div class="offline-content">
        <i class="fas fa-wifi"></i>
        <h3>You are currently offline</h3>
        <p>Some features may be limited until your connection is restored.</p>
      </div>
    `;
    message.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background-color: #1B512D;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 9999;
      display: flex;
      align-items: center;
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform: translateY(100px);
      opacity: 0;
    `;
    return message;
  }
  
  // Show/hide offline message based on connection status
  function updateOfflineStatus() {
    let offlineMessage = document.querySelector('.offline-message');
    
    if (!navigator.onLine) {
      if (!offlineMessage) {
        offlineMessage = createOfflineMessage();
        document.body.appendChild(offlineMessage);
        // Trigger animation after a small delay
        setTimeout(() => {
          offlineMessage.style.transform = 'translateY(0)';
          offlineMessage.style.opacity = '1';
        }, 10);
      }
    } else if (offlineMessage) {
      offlineMessage.style.transform = 'translateY(100px)';
      offlineMessage.style.opacity = '0';
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        if (offlineMessage.parentNode) {
          offlineMessage.parentNode.removeChild(offlineMessage);
        }
      }, 300);
    }
  }
  
  // Check for offline status initially
  window.addEventListener('load', updateOfflineStatus);
  
  // Listen for online/offline events
  window.addEventListener('online', updateOfflineStatus);
  window.addEventListener('offline', updateOfflineStatus);
  
  // Also periodically check status (some browsers don't trigger events reliably)
  setInterval(updateOfflineStatus, 5000);
  
  // Additional offline features - store form data locally
  function setupOfflineFormBackup() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const formInputs = form.querySelectorAll('input, textarea, select');
      
      // Save form data on input change
      formInputs.forEach(input => {
        input.addEventListener('change', () => {
          if (typeof localStorage !== 'undefined') {
            const key = `form_${form.id || form.getAttribute('class')}_${input.id || input.name}`;
            localStorage.setItem(key, input.value);
          }
        });
        
        // Restore form data on page load
        if (typeof localStorage !== 'undefined') {
          const key = `form_${form.id || form.getAttribute('class')}_${input.id || input.name}`;
          const savedValue = localStorage.getItem(key);
          if (savedValue) {
            input.value = savedValue;
          }
        }
      });
      
      // Clear saved data on successful submission
      form.addEventListener('submit', () => {
        if (navigator.onLine && typeof localStorage !== 'undefined') {
          formInputs.forEach(input => {
            const key = `form_${form.id || form.getAttribute('class')}_${input.id || input.name}`;
            localStorage.removeItem(key);
          });
        }
      });
    });
  }
  
  // Initialize offline form backup if supported
  if (typeof localStorage !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupOfflineFormBackup);
    } else {
      setupOfflineFormBackup();
    }
  }
})();
