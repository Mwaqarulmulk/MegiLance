const fs = require('fs');
const path = require('path');

// Create a simple 1x1 pixel PNG for each screenshot with different colors
const screenshots = [
  { name: 'ai-matching.png', color: '4573df' },           // Blue
  { name: 'blockchain-payments.png', color: 'ff9800' },   // Orange
  { name: 'project-dashboard.png', color: '4caf50' },     // Green
  { name: 'talent-profiles.png', color: '9c27b0' }        // Purple
];

// PNG header for a 1x1 pixel image with a specific color
const createPNG = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Simple 1x1 PNG with the specified color
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
    0x9f, 0x19, 0xf9, 0x63, // IHDR CRC
    0x00, 0x00, 0x00, 0x0a, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9c, 0x63, 0x64, 0x60, 0x60, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, // Compressed data
    0x84, 0xa4, 0x65, 0xaa, // IDAT CRC
    0x00, 0x00, 0x00, 0x0c, // IEND chunk length
    0x49, 0x45, 0x4e, 0x44, // IEND
    0xae, 0x42, 0x60, 0x82  // IEND CRC
  ]);
};

// Create the screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'public', 'images', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Create each screenshot
screenshots.forEach(screenshot => {
  const filePath = path.join(screenshotsDir, screenshot.name);
  const pngBuffer = createPNG(screenshot.color);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Created ${screenshot.name} with color #${screenshot.color}`);
});

console.log('All placeholder images created successfully!');