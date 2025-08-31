const fs = require('fs');
const path = require('path');

// Create a simple SVG placeholder
const svgContent = `
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#4A90E2"/>
  <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">BDP</text>
</svg>
`;

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Create placeholder files
const files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];
files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  // Just create empty files for now
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }
});

console.log('Placeholder asset files created successfully!');