/*
 * Additional icon fix for Ubora Services website
 * This script ensures all social media icons are properly displayed
 */

document.addEventListener('DOMContentLoaded', function() {
  // Force all Font Awesome icons to be visible, especially in social links
  const allFontAwesomeIcons = document.querySelectorAll('.fab, .fas, .far, .fa');
  
  allFontAwesomeIcons.forEach(icon => {
    icon.style.display = 'inline-block';
    icon.style.fontStyle = 'normal';
    icon.style.fontFamily = '"Font Awesome 6 Free", "Font Awesome 6 Brands", FontAwesome';
    icon.style.textRendering = 'auto';
    icon.style.WebkitFontSmoothing = 'antialiased';
    icon.style.visibility = 'visible !important';
    icon.style.opacity = '1 !important';
  });
  
  // Specifically target social media icons
  const socialFacebookIcons = document.querySelectorAll('.fa-facebook-f, .fa-facebook');
  socialFacebookIcons.forEach(icon => {
    icon.style.color = icon.closest('.social-icon, .social-icons a') ? 'white' : 'inherit';
  });
  
  const socialInstagramIcons = document.querySelectorAll('.fa-instagram');
  socialInstagramIcons.forEach(icon => {
    icon.style.color = icon.closest('.social-icon, .social-icons a') ? 'white' : 'inherit';
  });
  
  const socialWhatsappIcons = document.querySelectorAll('.fa-whatsapp');
  socialWhatsappIcons.forEach(icon => {
    icon.style.color = icon.closest('.social-icon, .social-icons a, .whatsapp-float') ? 'white' : 'inherit';
  });
});
