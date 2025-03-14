// Script to copy documentation files to the public directory with support for hierarchical structure
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively copy files from source to destination
 * @param {string} sourceDir - Source directory
 * @param {string} destDir - Destination directory
 */
function copyFilesRecursively(sourceDir, destDir) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Read all files and directories in the source directory
  const items = fs.readdirSync(sourceDir);

  // Process each item (file or directory)
  items.forEach(item => {
    const sourcePath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);
    
    // Check if it's a directory or file
    const stats = fs.statSync(sourcePath);
    
    if (stats.isDirectory()) {
      // Recursively copy subdirectories
      copyFilesRecursively(sourcePath, destPath);
    } else if (item.endsWith('.md')) {
      // Copy markdown files
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${sourcePath} to ${destPath}`);
    }
  });
}

// Main execution
const docsDir = path.join(__dirname, 'docs');
const publicDocsDir = path.join(__dirname, 'public', 'docs');

// Create the main docs directory if it doesn't exist
if (!fs.existsSync(publicDocsDir)) {
  fs.mkdirSync(publicDocsDir, { recursive: true });
  console.log('Created public/docs directory');
}

// Copy all documentation files recursively
copyFilesRecursively(docsDir, publicDocsDir);

console.log('Documentation files copied successfully!');
