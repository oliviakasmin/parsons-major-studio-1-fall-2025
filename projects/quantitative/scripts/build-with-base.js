import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the base path from environment variable or default to production
const basePath =
  process.env.BASE_PATH ||
  '/parsons-major-studio-1-fall-2025/projects/quantitative/';

// Read the current vite.config.ts
const configPath = path.join(__dirname, '..', 'vite.config.ts');
const originalConfig = fs.readFileSync(configPath, 'utf8');

// Update the base path in the config
const updatedConfig = originalConfig.replace(
  /base:\s*['"`][^'"`]*['"`]/,
  `base: '${basePath}'`
);

// Write the updated config
fs.writeFileSync(configPath, updatedConfig);

console.log(`Building with base path: ${basePath}`);

// Run the build
try {
  execSync('npm run build', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('Build completed successfully!');
} finally {
  // Restore the original config
  fs.writeFileSync(configPath, originalConfig);
  console.log('Restored original vite.config.ts');
}
