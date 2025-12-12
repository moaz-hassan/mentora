/**
 * Script to remove comments from JavaScript/TypeScript files
 * Run with: node remove-comments.js
 */

const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
  './frontend/app',
  './frontend/components',
  './frontend/lib',
  './frontend/hooks',
  './frontend/store',
  './backend/src',
  './backend/controllers',
  './backend/models',
  './backend/routes',
  './backend/middleware',
  './backend/services',
  './backend/utils',
  './backend/config',
];

// File extensions to process
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Patterns to skip (node_modules, etc.)
const skipPatterns = ['node_modules', '.next', 'dist', 'build', '.git'];

function removeComments(content) {
  // Remove single-line comments (but not URLs with //)
  let result = content.replace(/(?<!:)\/\/(?![\s]*@).*$/gm, '');
  
  // Remove multi-line comments (but keep JSDoc @param, @returns, etc. for now)
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove empty lines that were left behind (more than 2 consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // Remove trailing whitespace on each line
  result = result.replace(/[ \t]+$/gm, '');
  
  return result;
}

function shouldSkip(filePath) {
  return skipPatterns.some(pattern => filePath.includes(pattern));
}

function processFile(filePath) {
  if (shouldSkip(filePath)) return;
  
  const ext = path.extname(filePath);
  if (!extensions.includes(ext)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = removeComments(content);
    
    if (content !== cleaned) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      console.log(`✓ Cleaned: ${filePath}`);
    }
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠ Directory not found: ${dirPath}`);
    return;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    
    if (shouldSkip(fullPath)) continue;
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  }
}

console.log('🧹 Removing comments from frontend and backend files...\n');

for (const dir of directories) {
  processDirectory(dir);
}

console.log('\n✅ Done!');
