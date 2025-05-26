#!/bin/bash
# Image optimization script for Ubora Services website

echo "Optimizing images for better web performance..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

# Check if webp tools are installed
if ! command -v cwebp &> /dev/null; then
    echo "WebP tools not found. Installing..."
    sudo apt-get install -y webp
fi

# Navigate to images directory
cd /home/Roman/Documents/tom3/images

# Convert and optimize existing images
for img in *.jpg *.jpeg *.png; do
    if [ -f "$img" ]; then
        echo "Processing $img..."
        
        # Get base name without extension
        base=$(basename "$img" | cut -d. -f1)
        
        # Create WebP version with high quality
        cwebp -q 85 "$img" -o "${base}.webp"
        
        # Create mobile version (smaller)
        convert "$img" -resize 800x600> -quality 80 "${base}-mobile.jpg"
        cwebp -q 80 "${base}-mobile.jpg" -o "${base}-mobile.webp"
        
        # Create tablet version
        convert "$img" -resize 1200x900> -quality 85 "${base}-tablet.jpg"
        cwebp -q 85 "${base}-tablet.jpg" -o "${base}-tablet.webp"
        
        # Optimize original JPEG
        convert "$img" -quality 85 -strip "${base}-optimized.jpg"
        
        echo "Created optimized versions for $img"
    fi
done

echo "Image optimization complete!"
echo "Files created:"
ls -la *.webp
