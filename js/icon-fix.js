/* 
   This script ensures that service icons and social icons are always visible
   regardless of device type or performance optimizations
*/

document.addEventListener('DOMContentLoaded', function() {
  // Force service icons to be visible
  const serviceIcons = document.querySelectorAll('.service-icon');
  
  serviceIcons.forEach(icon => {
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.opacity = '1';
    icon.style.visibility = 'visible';
    
    // Make sure Font Awesome icons are visible
    const faIcon = icon.querySelector('i');
    if (faIcon) {
      faIcon.style.display = 'inline-block';
      faIcon.style.opacity = '1';
      faIcon.style.visibility = 'visible';
    }
  });
  
  // Force social icons to be visible
  const socialIcons = document.querySelectorAll('.social-icon, .social-links a, .social-icons a');
  socialIcons.forEach(icon => {
    icon.style.display = 'inline-flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.opacity = '1';
    icon.style.visibility = 'visible';
    
    const faIcon = icon.querySelector('i');
    if (faIcon) {
      faIcon.style.display = 'inline-block';
      faIcon.style.opacity = '1';
      faIcon.style.visibility = 'visible';
    }
  });
});
