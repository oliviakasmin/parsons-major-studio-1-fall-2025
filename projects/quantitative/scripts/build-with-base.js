const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the base path from environment variable or default to production
const basePath = process.env.BASE_PATH || '/parsons-major-studio-1-fall-2025/projects/quantitative/';

// Read the current vite.config.ts
const configPath = path.join(__dirname, '..', 'vite.config.ts');
let config = fs.readFileSync(configPath, 'utf8');

// Update the base path in the config
config = config.replace(
  /base:\s*['"`][^'"`]*['"`]/,
  `base: '${basePath}'`
);

// Write the updated config
fs.writeFileSync(configPath, config);

console.log(`Building with base path: ${basePath}`);

// Run the build
try {
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
