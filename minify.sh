#!/bin/bash

# Minify script for CSS and JS files
# Run this script before deploying to production

# Check if required tools are installed
if ! command -v terser &> /dev/null; then
  echo "Installing terser for JS minification..."
  npm install -g terser
fi

if ! command -v clean-css-cli &> /dev/null; then
  echo "Installing clean-css-cli for CSS minification..."
  npm install -g clean-css-cli
fi

# Create minified directory if it doesn't exist
mkdir -p minified/css
mkdir -p minified/js

# Minify CSS files
echo "Minifying CSS files..."
for css_file in css/*.css; do
  filename=$(basename -- "$css_file")
  echo "Processing $filename"
  cleancss -o "minified/css/$filename" "$css_file"
done

# Minify JS files
echo "Minifying JS files..."
for js_file in js/*.js; do
  filename=$(basename -- "$js_file")
  echo "Processing $filename"
  terser "$js_file" -c -m -o "minified/js/$filename"
done

# Combine and minify critical CSS
echo "Creating combined critical CSS..."
cat css/critical.css css/fonts.css > minified/css/combined-critical.css
cleancss -o "minified/css/combined-critical.min.css" "minified/css/combined-critical.css"

# Create a minified version of the service worker
echo "Minifying service worker..."
terser sw.js sw-handlers.js -c -m -o minified/sw.min.js

# Create a production version of index.html
echo "Creating production version of index.html..."
cp index.html minified/index.html

# Replace CSS and JS references in the production HTML
sed -i 's|/css/|/minified/css/|g' minified/index.html
sed -i 's|/js/|/minified/js/|g' minified/index.html
sed -i 's|sw.js|minified/sw.min.js|g' minified/index.html

# Create htaccess file with cache and compression settings
echo "Creating .htaccess file with cache and compression settings..."
cat > minified/.htaccess << 'EOF'
# Enable GZIP compression
<IfModule mod_deflate.c>
  # Compress HTML, CSS, JavaScript, Text, XML and fonts
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/vnd.ms-fontobject
  AddOutputFilterByType DEFLATE application/x-font
  AddOutputFilterByType DEFLATE application/x-font-opentype
  AddOutputFilterByType DEFLATE application/x-font-otf
  AddOutputFilterByType DEFLATE application/x-font-truetype
  AddOutputFilterByType DEFLATE application/x-font-ttf
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE font/opentype
  AddOutputFilterByType DEFLATE font/otf
  AddOutputFilterByType DEFLATE font/ttf
  AddOutputFilterByType DEFLATE image/svg+xml
  AddOutputFilterByType DEFLATE image/x-icon
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml

  # Remove browser bugs (only needed for really old browsers)
  BrowserMatch ^Mozilla/4 gzip-only-text/html
  BrowserMatch ^Mozilla/4\.0[678] no-gzip
  BrowserMatch \bMSIE !no-gzip !gzip-only-text/html
  Header append Vary User-Agent
</IfModule>

# Enable browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  
  # Images
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  
  # Video
  ExpiresByType video/mp4 "access plus 1 year"
  ExpiresByType video/mpeg "access plus 1 year"
  
  # CSS, JavaScript
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  
  # Fonts
  ExpiresByType font/ttf "access plus 1 year"
  ExpiresByType font/otf "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType application/font-woff "access plus 1 year"
  
  # Others
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType application/x-shockwave-flash "access plus 1 month"
</IfModule>

# Set security headers
<IfModule mod_headers.c>
  # HSTS (HTTP Strict Transport Security)
  Header set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  
  # Content Security Policy
  Header set Content-Security-Policy "default-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://fonts.googleapis.com https://fonts.gstatic.com data:; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://fonts.googleapis.com; img-src 'self' data:; connect-src 'self'; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; frame-src 'self' https://www.google.com; object-src 'none'"
  
  # Prevent MIME type sniffing
  Header set X-Content-Type-Options "nosniff"
  
  # Protect against clickjacking
  Header set X-Frame-Options "SAMEORIGIN"
  
  # Enable XSS filter in browser
  Header set X-XSS-Protection "1; mode=block"
  
  # Prevent from showing in frames (same as X-Frame-Options)
  Header set Frame-Options "DENY"
  
  # Referrer policy
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  
  # Permissions policy
  Header set Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()"
</IfModule>
EOF

echo "Minification complete. Files are in the minified/ directory."
echo "Upload the contents of the minified/ directory to your production server."
echo "Don't forget to modify the paths in index.html if your directory structure is different."
