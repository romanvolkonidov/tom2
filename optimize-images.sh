#!/bin/bash

# Image optimization script for Ubora Services website
# Requires: imagemagick (convert command)

# Check for imagemagick
if ! command -v convert &> /dev/null; then
  echo "This script requires ImageMagick. Please install it first."
  echo "On Ubuntu/Debian: sudo apt-get install imagemagick"
  echo "On MacOS: brew install imagemagick"
  exit 1
fi

# Create output directories
mkdir -p images/optimized
mkdir -p images/webp

# Loop through all images in the images directory
for img in images/*.{jpg,jpeg,png}; do
  if [ -f "$img" ]; then
    # Get filename without extension
    filename=$(basename -- "$img")
    extension="${filename##*.}"
    filename="${filename%.*}"
    
    echo "Processing $img..."
    
    # Create WebP version (better compression, supported by most modern browsers)
    convert "$img" -quality 85 "images/webp/$filename.webp"
    echo "Created WebP version: images/webp/$filename.webp"
    
    # Create responsive versions
    # 1. Mobile version (up to 640px wide)
    convert "$img" -resize "640x>" -quality 85 "images/optimized/$filename-mobile.$extension"
    convert "images/optimized/$filename-mobile.$extension" -quality 85 "images/webp/$filename-mobile.webp"
    echo "Created mobile version: images/webp/$filename-mobile.webp"
    
    # 2. Tablet version (up to 1024px wide)
    convert "$img" -resize "1024x>" -quality 85 "images/optimized/$filename-tablet.$extension"
    convert "images/optimized/$filename-tablet.$extension" -quality 85 "images/webp/$filename-tablet.webp"
    echo "Created tablet version: images/webp/$filename-tablet.webp"
    
    # 3. Desktop version (up to 1920px wide)
    convert "$img" -resize "1920x>" -quality 85 "images/optimized/$filename-desktop.$extension"
    convert "images/optimized/$filename-desktop.$extension" -quality 85 "images/webp/$filename-desktop.webp"
    echo "Created desktop version: images/webp/$filename-desktop.webp"
    
    echo "Optimized versions of $filename created successfully."
    echo "----------------------------------------"
  fi
done

echo "Image optimization complete!"
echo "Use the following HTML pattern for responsive images:"
echo ""
echo "<picture>"
echo '  <source srcset="images/webp/image-mobile.webp" media="(max-width: 640px)" type="image/webp">'
echo '  <source srcset="images/webp/image-tablet.webp" media="(min-width: 641px) and (max-width: 1024px)" type="image/webp">'
echo '  <source srcset="images/webp/image-desktop.webp" media="(min-width: 1025px)" type="image/webp">'
echo '  <img src="images/optimized/image-mobile.jpg" alt="Description" width="auto" height="auto" loading="lazy">'
echo "</picture>"
