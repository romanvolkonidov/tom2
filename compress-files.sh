#!/bin/bash
# Text compression script for better web performance

echo "Creating compressed versions of text files..."

cd /home/Roman/Documents/tom3

# Compress CSS files
echo "Compressing CSS files..."
for css in css/*.css; do
    if [ -f "$css" ]; then
        gzip -c -9 "$css" > "${css}.gz"
        echo "Compressed $css"
    fi
done

# Compress JavaScript files
echo "Compressing JavaScript files..."
for js in js/*.js; do
    if [ -f "$js" ]; then
        gzip -c -9 "$js" > "${js}.gz"
        echo "Compressed $js"
    fi
done

# Compress HTML file
echo "Compressing HTML file..."
gzip -c -9 index.html > index.html.gz

# Create .htaccess for automatic compression serving
echo "Creating .htaccess for automatic compression..."
cat > .htaccess << 'EOF'
# Enable compression
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
</IfModule>

# Serve pre-compressed files if available
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTP:Accept-Encoding} gzip
    RewriteCond %{REQUEST_FILENAME}\.gz -f
    RewriteRule ^(.*)$ $1.gz [QSA,L]
    
    # Serve correct content types
    <FilesMatch "\.css\.gz$">
        ForceType text/css
        Header set Content-Encoding gzip
    </FilesMatch>
    <FilesMatch "\.js\.gz$">
        ForceType application/javascript
        Header set Content-Encoding gzip
    </FilesMatch>
    <FilesMatch "\.html\.gz$">
        ForceType text/html
        Header set Content-Encoding gzip
    </FilesMatch>
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
EOF

echo "Text compression complete!"
echo "Compressed files:"
find . -name "*.gz" -type f
