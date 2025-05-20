#!/bin/bash

# This script extracts and combines critical CSS for faster page loading
echo "Creating combined critical CSS for above-the-fold content..."

# Define source files and output
CRITICAL_CSS="css/critical.css"
FONTS_CSS="css/fonts.css"
MOBILE_CRITICAL="css/mobile-critical.css"
OUTPUT_CSS="css/combined-critical.css"

# Create output directory if it doesn't exist
mkdir -p $(dirname "$OUTPUT_CSS")

# Combine critical CSS files
cat "$CRITICAL_CSS" "$FONTS_CSS" > "$OUTPUT_CSS"

# Extract critical rules from standard CSS files
# This uses a simple grep approach to find common selectors that affect above-the-fold content
echo "/* Auto-extracted critical styles from main CSS */" >> "$OUTPUT_CSS"

# Extract critical selectors from style.css
grep -E "body|html|navbar|header|hero|container|row|button|.btn|.nav-|.text-logo|.whatsapp-|.bg-|h1|h2|h3|.fa-|.lead|.hero-|@media \(max-width|@font-face" css/style.css >> "$OUTPUT_CSS"

# Extract mobile-specific critical styles
echo "/* Mobile-specific critical styles */" >> "$OUTPUT_CSS"
cat "$MOBILE_CRITICAL" >> "$OUTPUT_CSS"

# Minify the critical CSS if clean-css is available
if command -v cleancss &> /dev/null; then
  echo "Minifying critical CSS..."
  cleancss -o "css/combined-critical.min.css" "$OUTPUT_CSS"
  echo "Created minified version at css/combined-critical.min.css"
else
  echo "cleancss not found. Install with: npm install -g clean-css-cli"
fi

echo "Critical CSS extraction complete!"
echo "To use in production, inline the contents of $OUTPUT_CSS in the <head> of your HTML."
