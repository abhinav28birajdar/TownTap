/**
 * TownTap Project Cleanup Script
 * 
 * This script analyzes the project structure and removes:
 * - Empty files
 * - Duplicate SQL schema files
 * - Redundant documentation
 * - Duplicate component files
 * - Redundant fix scripts
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Helper function for console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Stats tracking
let stats = {
  filesAnalyzed: 0,
  emptyRemoved: 0,
  duplicatesRemoved: 0,
  redundantRemoved: 0,
  componentsFixed: 0
};

// Files to be excluded from cleanup
const excludedFiles = [
  '.git',
  'node_modules',
  '.expo',
  'cleanup-project.js'
];

// Specific redundant files that should be deleted
const redundantFiles = [
  // Empty or redundant SQL files
  'TOWNTAP_COMPLETE_SCHEMA.sql',
  'TOWNTAP_DATABASE.sql',
  'FINAL_DATABASE_SCHEMA.sql',
  
  // Redundant markdown files
  'BUNDLING_FIX_SUCCESS.md',
  'README_NEW.md',
  'URGENT_FIX_GUIDE.md',
  
  // Duplicate fix scripts
  'fix-jsx.js', // Already have scripts/fix-jsx-in-js.js
  
  // Backup files
  'package.json.backup',
  '.env.backup',
];

// Duplicate component directories (prefer src/components)
const componentsToMove = [
  { from: 'components/ExternalLink.tsx', to: 'src/components/ExternalLink.tsx' },
  { from: 'components/HapticTab.tsx', to: 'src/components/HapticTab.tsx' },
  { from: 'components/HelloWave.tsx', to: 'src/components/HelloWave.tsx' },
  { from: 'components/ThemedText.tsx', to: 'src/components/ThemedText.tsx' },
  { from: 'components/ThemedView.tsx', to: 'src/components/ThemedView.tsx' },
];

// Check if file is empty
function isEmptyFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile() && stats.size === 0;
  } catch (err) {
    return false;
  }
}

// Generate content hash for file comparison
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch (err) {
    console.log(`${colors.yellow}⚠️ Could not read file ${filePath}: ${err.message}${colors.reset}`);
    return null;
  }
}

// Find duplicate files based on content hash
function findDuplicateFiles() {
  console.log(`${colors.cyan}Looking for duplicate files...${colors.reset}`);
  
  const filesByHash = {};
  const duplicates = [];
  
  function scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        
        // Skip excluded directories
        if (excludedFiles.some(excluded => itemPath.includes(excluded))) {
          continue;
        }
        
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          scanDirectory(itemPath);
        } else if (stats.isFile() && stats.size > 0) {
          // Only hash files with content
          const hash = getFileHash(itemPath);
          stats.filesAnalyzed++;
          
          if (hash) {
            if (!filesByHash[hash]) {
              filesByHash[hash] = [];
            }
            filesByHash[hash].push(itemPath);
          }
        }
      }
    } catch (err) {
      console.error(`${colors.red}Error scanning directory ${dirPath}: ${err.message}${colors.reset}`);
    }
  }
  
  // Start scanning from the root directory
  scanDirectory('.');
  
  // Find files with the same hash
  for (const hash in filesByHash) {
    if (filesByHash[hash].length > 1) {
      duplicates.push(filesByHash[hash]);
    }
  }
  
  return duplicates;
}

// Remove all empty files
function removeEmptyFiles() {
  console.log(`${colors.cyan}Looking for empty files...${colors.reset}`);
  
  function scanForEmptyFiles(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        
        // Skip excluded directories
        if (excludedFiles.some(excluded => itemPath.includes(excluded))) {
          continue;
        }
        
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          scanForEmptyFiles(itemPath);
        } else if (stats.isFile()) {
          stats.filesAnalyzed++;
          if (isEmptyFile(itemPath)) {
            console.log(`${colors.yellow}Found empty file: ${itemPath}${colors.reset}`);
            try {
              fs.unlinkSync(itemPath);
              console.log(`${colors.green}✓ Removed empty file: ${itemPath}${colors.reset}`);
              stats.emptyRemoved++;
            } catch (err) {
              console.error(`${colors.red}✗ Error removing ${itemPath}: ${err.message}${colors.reset}`);
            }
          }
        }
      }
    } catch (err) {
      console.error(`${colors.red}Error scanning directory ${dirPath}: ${err.message}${colors.reset}`);
    }
  }
  
  // Start scanning from the root directory
  scanForEmptyFiles('.');
}

// Remove specified redundant files
function removeRedundantFiles() {
  console.log(`${colors.cyan}Removing known redundant files...${colors.reset}`);
  
  for (const file of redundantFiles) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`${colors.green}✓ Removed redundant file: ${file}${colors.reset}`);
        stats.redundantRemoved++;
      }
    } catch (err) {
      console.error(`${colors.red}✗ Error removing ${file}: ${err.message}${colors.reset}`);
    }
  }
}

// Move components from root to src/components
function moveComponentsToSrc() {
  console.log(`${colors.cyan}Moving components to src/components directory...${colors.reset}`);
  
  for (const {from, to} of componentsToMove) {
    try {
      if (fs.existsSync(from)) {
        // Create directory if it doesn't exist
        const dir = path.dirname(to);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Copy file content
        const content = fs.readFileSync(from, 'utf8');
        fs.writeFileSync(to, content);
        
        // Remove original file
        fs.unlinkSync(from);
        
        console.log(`${colors.green}✓ Moved component: ${from} → ${to}${colors.reset}`);
        stats.componentsFixed++;
      }
    } catch (err) {
      console.error(`${colors.red}✗ Error moving component ${from}: ${err.message}${colors.reset}`);
    }
  }
  
  // If all components were moved, try to remove the empty directory
  try {
    const emptyDirs = ['components', 'components/ui'];
    for (const dir of emptyDirs) {
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        console.log(`${colors.green}✓ Removed empty directory: ${dir}${colors.reset}`);
      }
    }
  } catch (err) {
    console.error(`${colors.red}✗ Error removing empty directories: ${err.message}${colors.reset}`);
  }
}

// Main cleanup function
function cleanupProject() {
  console.log(`${colors.bright}${colors.blue}=== TownTap Project Cleanup ===
${colors.reset}`);
  
  // Run the cleanup tasks
  removeEmptyFiles();
  removeRedundantFiles();
  moveComponentsToSrc();
  
  // Find and report duplicates
  const duplicates = findDuplicateFiles();
  if (duplicates.length > 0) {
    console.log(`\n${colors.yellow}Found ${duplicates.length} sets of duplicate files:${colors.reset}`);
    
    duplicates.forEach((group, i) => {
      console.log(`\n${colors.cyan}Group ${i + 1}:${colors.reset}`);
      group.forEach(file => console.log(`  ${file}`));
      
      // Keep the first file, delete the rest
      for (let j = 1; j < group.length; j++) {
        try {
          // Skip important files that might be incorrectly detected
          if (group[j].includes('package.json') || group[j].includes('tsconfig.json') || 
              group[j].includes('.env') || group[j].includes('babel.config.js')) {
            console.log(`${colors.yellow}⚠️ Skipping important file: ${group[j]}${colors.reset}`);
            continue;
          }
          
          fs.unlinkSync(group[j]);
          console.log(`${colors.green}✓ Removed duplicate: ${group[j]}${colors.reset}`);
          stats.duplicatesRemoved++;
        } catch (err) {
          console.error(`${colors.red}✗ Error removing ${group[j]}: ${err.message}${colors.reset}`);
        }
      }
    });
  }
  
  // Print summary
  console.log(`\n${colors.bright}${colors.green}=== Cleanup Summary ===
${colors.reset}`);
  console.log(`${colors.green}✓ Files analyzed: ${stats.filesAnalyzed}${colors.reset}`);
  console.log(`${colors.green}✓ Empty files removed: ${stats.emptyRemoved}${colors.reset}`);
  console.log(`${colors.green}✓ Duplicate files removed: ${stats.duplicatesRemoved}${colors.reset}`);
  console.log(`${colors.green}✓ Known redundant files removed: ${stats.redundantRemoved}${colors.reset}`);
  console.log(`${colors.green}✓ Components moved to src: ${stats.componentsFixed}${colors.reset}`);
  console.log(`\n${colors.bright}${colors.blue}Project cleanup completed!${colors.reset}`);
}

// Execute the cleanup
cleanupProject();
