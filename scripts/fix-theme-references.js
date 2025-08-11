#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

console.log(`${colors.bright}${colors.cyan}TownTap Theme Reference Fixer${colors.reset}\n`);

// Define paths to check
const pathsToCheck = [
  'src/components',
  'src/screens',
  'src/navigation',
  'src/context',
];

// Theme import patterns to replace
const importPatterns = [
  {
    // Old import from modernTheme.ts
    pattern: /import\s+\{\s*(?:getTheme|Theme)\s*\}\s+from\s+['"]\.\.\/.*\/theme\/modernTheme['"]/g,
    replacement: "import { lightTheme, darkTheme, Theme } from '../theme/enhanced-theme'"
  },
  {
    // Old import from theme.ts
    pattern: /import\s+\{\s*(?:theme|darkTheme|Theme)\s*\}\s+from\s+['"]\.\.\/.*\/theme\/theme['"]/g,
    replacement: "import { lightTheme as theme, darkTheme, Theme } from '../theme/enhanced-theme'"
  },
  {
    // Fix ThemeContext imports
    pattern: /import\s+\{\s*(?:useTheme|ThemeProvider)\s*\}\s+from\s+['"]\.\.\/.*\/context\/ThemeContext['"]/g,
    replacement: "import { useTheme, ThemeProvider } from '../context/ModernThemeContext'"
  }
];

// Function to process a file
function processFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      let modified = content;
      let hasChanges = false;
      
      // Apply replacements
      importPatterns.forEach(({ pattern, replacement }) => {
        if (pattern.test(modified)) {
          modified = modified.replace(pattern, replacement);
          hasChanges = true;
        }
      });
      
      // Only write if changes were made
      if (hasChanges) {
        fs.writeFileSync(filePath, modified);
        console.log(`  ${colors.green}✓ Updated theme references in: ${filePath}${colors.reset}`);
        return true;
      }
    }
  } catch (err) {
    console.error(`  ${colors.red}✗ Error processing ${filePath}: ${err.message}${colors.reset}`);
  }
  return false;
}

// Function to scan directories recursively
function scanDir(dir) {
  if (!fs.existsSync(dir)) {
    return 0;
  }

  let fixedFiles = 0;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory() && !filePath.includes('node_modules')) {
      fixedFiles += scanDir(filePath);
    } else if ((filePath.endsWith('.tsx') || filePath.endsWith('.ts') || 
                filePath.endsWith('.jsx') || filePath.endsWith('.js')) && 
               !filePath.includes('node_modules')) {
      if (processFile(filePath)) {
        fixedFiles++;
      }
    }
  });
  
  return fixedFiles;
}

// Update ModernThemeContext.tsx to use enhanced theme
function updateModernThemeContext() {
  console.log(`${colors.yellow}Updating ModernThemeContext.tsx...${colors.reset}`);
  
  const filePath = 'src/context/ModernThemeContext.tsx';
  
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace getTheme import with lightTheme/darkTheme import
      content = content.replace(
        /import\s+\{\s*getTheme,\s*Theme\s*\}\s+from\s+['"]\.\.\/theme\/modernTheme['"]/,
        "import { lightTheme, darkTheme, Theme } from '../theme/enhanced-theme'"
      );
      
      // Replace getTheme usage with direct theme object reference
      content = content.replace(
        /const theme = getTheme\(colorScheme\);/,
        "const theme = colorScheme === 'dark' ? darkTheme : lightTheme;"
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`  ${colors.green}✓ Updated ModernThemeContext.tsx to use enhanced theme${colors.reset}`);
    } else {
      console.log(`  ⚠️ ModernThemeContext.tsx not found`);
    }
  } catch (err) {
    console.error(`  ${colors.red}✗ Error updating ModernThemeContext.tsx: ${err.message}${colors.reset}`);
  }
  
  console.log('');
}

// Main function to run the fixer
function main() {
  console.log(`${colors.yellow}Scanning for theme references to fix...${colors.reset}`);
  
  // First update ModernThemeContext
  updateModernThemeContext();
  
  // Then scan all directories for imports to fix
  let totalFixed = 0;
  pathsToCheck.forEach(dir => {
    const fixed = scanDir(dir);
    totalFixed += fixed;
    console.log(`  ${colors.cyan}${dir}: Fixed ${fixed} files${colors.reset}`);
  });
  
  if (totalFixed > 0) {
    console.log(`\n${colors.green}✓ Successfully fixed theme references in ${totalFixed} files${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}No theme references needed fixing${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}${colors.green}Theme reference fixing completed!${colors.reset}`);
}

// Run the main function
main();
