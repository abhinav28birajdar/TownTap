/**
 * Path Alias Optimization Script
 * Updates all imports to use the configured path aliases from babel.config.js
 */

const fs = require('fs');
const path = require('path');

// Console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Path alias mappings (matching babel.config.js)
const aliases = {
  '@app': './src',
  '@components': './src/components',
  '@screens': './src/screens',
  '@services': './src/services',
  '@utils': './src/utils',
  '@hooks': './src/hooks',
  '@assets': './assets',
  '@stores': './src/stores',
  '@types': './src/types',
  '@theme': './src/theme',
  '@context': './src/context',
  '@navigation': './src/navigation'
};

let stats = {
  filesProcessed: 0,
  importsUpdated: 0,
  errors: 0
};

function updateImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Process import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Skip if already using alias or external package
      if (importPath.startsWith('@') || !importPath.startsWith('.')) {
        continue;
      }
      
      // Calculate the absolute path from the current file
      const currentDir = path.dirname(filePath);
      const absoluteImportPath = path.resolve(currentDir, importPath);
      const projectRoot = process.cwd();
      let relativePath = path.relative(projectRoot, absoluteImportPath);
      
      // Normalize path separators for cross-platform compatibility
      relativePath = relativePath.replace(/\\\\/g, '/');
      
      // Find matching alias
      let aliasReplacement = null;
      for (const [alias, aliasPath] of Object.entries(aliases)) {
        const normalizedAliasPath = aliasPath.replace('./', '').replace(/\\\\/g, '/');
        if (relativePath.startsWith(normalizedAliasPath)) {
          aliasReplacement = relativePath.replace(normalizedAliasPath, alias);
          break;
        }
      }
      
      if (aliasReplacement) {
        const fullMatch = match[0];
        const newImport = fullMatch.replace(importPath, aliasReplacement);
        updatedContent = updatedContent.replace(fullMatch, newImport);
        hasChanges = true;
        stats.importsUpdated++;
        
        console.log(`  ${colors.green}✓${colors.reset} ${importPath} → ${aliasReplacement}`);
      }
    }
    
    // Also update require statements
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      const requirePath = match[1];
      
      if (requirePath.startsWith('@') || !requirePath.startsWith('.')) {
        continue;
      }
      
      const currentDir = path.dirname(filePath);
      const absoluteRequirePath = path.resolve(currentDir, requirePath);
      const projectRoot = process.cwd();
      let relativePath = path.relative(projectRoot, absoluteRequirePath);
      relativePath = relativePath.replace(/\\\\/g, '/');
      
      let aliasReplacement = null;
      for (const [alias, aliasPath] of Object.entries(aliases)) {
        const normalizedAliasPath = aliasPath.replace('./', '').replace(/\\\\/g, '/');
        if (relativePath.startsWith(normalizedAliasPath)) {
          aliasReplacement = relativePath.replace(normalizedAliasPath, alias);
          break;
        }
      }
      
      if (aliasReplacement) {
        const fullMatch = match[0];
        const newRequire = fullMatch.replace(requirePath, aliasReplacement);
        updatedContent = updatedContent.replace(fullMatch, newRequire);
        hasChanges = true;
        stats.importsUpdated++;
        
        console.log(`  ${colors.green}✓${colors.reset} ${requirePath} → ${aliasReplacement}`);
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`${colors.cyan}Updated: ${filePath}${colors.reset}`);
    }
    
    stats.filesProcessed++;
    return hasChanges;
    
  } catch (error) {
    console.error(`${colors.yellow}Error processing ${filePath}: ${error.message}${colors.reset}`);
    stats.errors++;
    return false;
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .git, .expo
        if (!item.includes('node_modules') && 
            !item.includes('.git') && 
            !item.includes('.expo') &&
            !item.includes('build')) {
          processDirectory(itemPath);
        }
      } else if (stat.isFile()) {
        // Process TypeScript, JavaScript, and JSX files
        if (item.match(/\\.(ts|tsx|js|jsx)$/)) {
          updateImportsInFile(itemPath);
        }
      }
    }
  } catch (error) {
    console.error(`${colors.yellow}Error reading directory ${dirPath}: ${error.message}${colors.reset}`);
    stats.errors++;
  }
}

function main() {
  console.log(`${colors.bright}${colors.blue}=== Path Alias Optimization ===${colors.reset}\n`);
  console.log(`${colors.cyan}Updating imports to use path aliases...${colors.reset}\n`);
  
  // Start processing from src directory
  const srcDir = path.join(process.cwd(), 'src');
  if (fs.existsSync(srcDir)) {
    processDirectory(srcDir);
  }
  
  // Also process app directory if it exists
  const appDir = path.join(process.cwd(), 'app');
  if (fs.existsSync(appDir)) {
    processDirectory(appDir);
  }
  
  // Process root TypeScript files
  const rootFiles = ['App.tsx', 'App.ts', 'index.ts', 'index.tsx'];
  rootFiles.forEach(file => {
    if (fs.existsSync(file)) {
      updateImportsInFile(file);
    }
  });
  
  console.log(`\n${colors.bright}${colors.green}=== Optimization Complete ===${colors.reset}`);
  console.log(`${colors.green}✓ Files processed: ${stats.filesProcessed}${colors.reset}`);
  console.log(`${colors.green}✓ Imports updated: ${stats.importsUpdated}${colors.reset}`);
  if (stats.errors > 0) {
    console.log(`${colors.yellow}⚠ Errors encountered: ${stats.errors}${colors.reset}`);
  }
  
  if (stats.importsUpdated > 0) {
    console.log(`\n${colors.cyan}Path aliases have been applied!${colors.reset}`);
    console.log(`${colors.cyan}You may need to restart your development server.${colors.reset}`);
  } else {
    console.log(`\n${colors.cyan}No imports needed updating.${colors.reset}`);
  }
}

main();
