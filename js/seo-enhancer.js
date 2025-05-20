/**
 * Service-Specific SEO Enhancer for Ubora Services
 * This script adds rich structured data for each service type
 * to improve search engine visibility of individual services
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create detailed service-specific schema for each service
    const serviceSchemas = [
        // Cleaning Service Schema
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Professional Cleaning Services",
            "provider": {
                "@type": "LocalBusiness",
                "name": "Ubora Services Limited",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Adala Otuko Road, Milimani area",
                    "addressLocality": "Kisumu",
                    "postalCode": "40100",
                    "addressCountry": "KE"
                }
            },
            "areaServed": [
                "Kisumu", "Homabay", "Kisii", "Nyamira", "Kericho", 
                "Bomet", "Migori", "Siaya", "Kakamega", "Bungoma", 
                "Busia", "Transzoia", "Uasin Gishu", "Nandi"
            ],
            "description": "Professional cleaning of facilities and homes with attention to detail and quality assurance throughout Western Kenya.",
            "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock",
                "priceSpecification": {
                    "@type": "PriceSpecification",
                    "priceCurrency": "KES"
                }
            },
            "name": "Professional Cleaning Services in Western Kenya",
            "url": "https://uboraservices.co.ke/#cleaning-services"
        },
        
        // Fumigation Service Schema
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Fumigation Services",
            "provider": {
                "@type": "LocalBusiness",
                "name": "Ubora Services Limited"
            },
            "areaServed": [
                "Kisumu", "Homabay", "Kisii", "Nyamira", "Kericho", 
                "Bomet", "Migori", "Siaya", "Kakamega", "Bungoma", 
                "Busia", "Transzoia", "Uasin Gishu", "Nandi"
            ],
            "description": "Licensed fumigation services against all flying and crawling pests by the Pest Control Products Board.",
            "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock"
            },
            "name": "Licensed Fumigation Services in Western Kenya",
            "url": "https://uboraservices.co.ke/#fumigation-services"
        },
        
        // Waste Collection Service Schema
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Waste Collection",
            "provider": {
                "@type": "LocalBusiness",
                "name": "Ubora Services Limited"
            },
            "areaServed": [
                "Kisumu", "Homabay", "Kisii", "Nyamira", "Kericho", 
                "Bomet", "Migori", "Siaya", "Kakamega", "Bungoma", 
                "Busia", "Transzoia", "Uasin Gishu", "Nandi"
            ],
            "description": "NEMA-licensed collection of general garbage, hazardous waste, biomedical waste, and sewage.",
            "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock"
            },
            "name": "NEMA-Licensed Waste Collection in Western Kenya",
            "url": "https://uboraservices.co.ke/#waste-collection"
        },
        
        // Errand Services Schema
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Errand Services",
            "provider": {
                "@type": "LocalBusiness",
                "name": "Ubora Services Limited"
            },
            "areaServed": "Western Kenya",
            "description": "General errands, farm supervision, construction monitoring, and medical errands.",
            "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock"
            },
            "name": "Professional Errand Services in Western Kenya",
            "url": "https://uboraservices.co.ke/#errand-services"
        },
        
        // Electrical Services Schema
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Electrical & Solar Services",
            "provider": {
                "@type": "LocalBusiness",
                "name": "Ubora Services Limited"
            },
            "areaServed": "Western Kenya",
            "description": "Professional electrical, solar, and CCTV installation and repair services.",
            "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock"
            },
            "name": "Electrical & Solar Installation in Western Kenya",
            "url": "https://uboraservices.co.ke/#electrical-services"
        },
        
        // Building Services Schema
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Building Services",
            "provider": {
                "@type": "LocalBusiness",
                "name": "Ubora Services Limited"
            },
            "areaServed": "Western Kenya",
            "description": "Plumbing, masonry, painting, tiling, and office partitioning services.",
            "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock"
            },
            "name": "Professional Building Services in Western Kenya",
            "url": "https://uboraservices.co.ke/#building-services"
        }
    ];
    
    // Add each service schema to the page
    serviceSchemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    });
    
    // Add IDs to individual service cards for deep linking
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0) {
        // Cleaning services (first card)
        if (serviceCards[0]) {
            serviceCards[0].id = 'cleaning-services';
        }
        
        // Fumigation services (second card)
        if (serviceCards[1]) {
            serviceCards[1].id = 'fumigation-services';
        }
        
        // Waste collection (third card)
        if (serviceCards[2]) {
            serviceCards[2].id = 'waste-collection';
        }
        
        // Errand services (fourth card)
        if (serviceCards[3]) {
            serviceCards[3].id = 'errand-services';
        }
        
        // Electrical services (fifth card)
        if (serviceCards[4]) {
            serviceCards[4].id = 'electrical-services';
        }
        
        // Building services (sixth card)
        if (serviceCards[5]) {
            serviceCards[5].id = 'building-services';
        }
    }
    
    // Add service-specific keywords to relevant sections
    function enhanceServiceSections() {
        // Add specific keywords to each service description
        const serviceHeadings = document.querySelectorAll('.service-card h3');
        serviceHeadings.forEach(heading => {
            const text = heading.textContent.toLowerCase();
            
            // Add location references for better local SEO
            const serviceDescription = heading.nextElementSibling;
            if (serviceDescription && serviceDescription.tagName === 'P') {
                let enhancedText = serviceDescription.textContent;
                
                if (text.includes('cleaning')) {
                    enhancedText += ' Serving homes and businesses in Kisumu and across Western Kenya counties.';
                } else if (text.includes('fumigation')) {
                    enhancedText += ' Available in all Western Kenya counties with certified pest control experts.';
                } else if (text.includes('waste')) {
                    enhancedText += ' NEMA-compliant waste management serving homes and businesses throughout Western Kenya.';
                }
                
                serviceDescription.textContent = enhancedText;
            }
        });
    }
    
    // Execute after slight delay to ensure DOM is fully loaded
    setTimeout(enhanceServiceSections, 1000);
    
    // Add support for direct navigation to service sections via URL fragments
    function handleURLFragmentNavigation() {
        const fragment = window.location.hash.substring(1);
        if (fragment) {
            const targetElement = document.getElementById(fragment);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 500);
            }
        }
    }
    
    // Handle fragment navigation on page load
    handleURLFragmentNavigation();
    
    // Handle fragment navigation on hash change
    window.addEventListener('hashchange', handleURLFragmentNavigation);
});
