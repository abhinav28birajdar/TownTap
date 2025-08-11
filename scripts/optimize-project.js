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

console.log(`${colors.bright}${colors.cyan}TownTap Project Optimization Script${colors.reset}\n`);

// Define redundant files to remove
const redundantFiles = [
  // Documentation duplicates
  'README_COMPLETE.md',
  'README_FINAL.md',
  'README_NEW.md',
  'APP_FLOW_SUMMARY.md',
  'DATABASE_FIX_README.md',
  'ENVIRONMENT_SETUP_COMPLETE.md',
  'PROJECT_CLEANUP_SUMMARY.md',
  'SETUP_INSTRUCTIONS.md',
  'WARNING_FIXES_SUMMARY.md',
  
  // Old theme files
  'src/theme/theme.ts',
  
  // Use enhanced versions of these files
  'src/stores/locationStore.ts', // Using locationStoreNew.ts instead
  'src/types/index.ts', // Using index_new.ts instead
];

// Files to rename
const filesToRename = [
  { from: 'src/theme/enhanced-theme.ts', to: 'src/theme/modernTheme.ts' },
  { from: 'src/types/index_new.ts', to: 'src/types/index.ts' },
  { from: 'src/stores/locationStoreNew.ts', to: 'src/stores/locationStore.ts' },
];

// Create symbolic links to modern components
const symbolicLinks = [
  { from: 'src/components/modern/ModernButton.tsx', to: 'src/components/ui/Button.tsx' },
  { from: 'src/components/modern/ModernCard.tsx', to: 'src/components/ui/Card.tsx' },
  { from: 'src/components/modern/ModernInput.tsx', to: 'src/components/ui/Input.tsx' },
];

// Function to remove redundant files
function removeRedundantFiles() {
  console.log(`${colors.yellow}Removing redundant files...${colors.reset}`);
  
  redundantFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`  ${colors.green}✓ Removed: ${file}${colors.reset}`);
      } else {
        console.log(`  ⚠️ File not found: ${file}`);
      }
    } catch (err) {
      console.error(`  ${colors.red}✗ Error removing ${file}: ${err.message}${colors.reset}`);
    }
  });
  
  console.log('');
}

// Function to rename files
function renameFiles() {
  console.log(`${colors.yellow}Renaming files to their optimized versions...${colors.reset}`);
  
  filesToRename.forEach(({ from, to }) => {
    try {
      if (fs.existsSync(from)) {
        // Create directory if it doesn't exist
        const dir = path.dirname(to);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.copyFileSync(from, to);
        fs.unlinkSync(from);
        console.log(`  ${colors.green}✓ Renamed: ${from} → ${to}${colors.reset}`);
      } else {
        console.log(`  ⚠️ Source file not found: ${from}`);
      }
    } catch (err) {
      console.error(`  ${colors.red}✗ Error renaming ${from} to ${to}: ${err.message}${colors.reset}`);
    }
  });
  
  console.log('');
}

// Function to create symbolic links
function createSymbolicLinks() {
  console.log(`${colors.yellow}Creating symbolic links for UI components...${colors.reset}`);
  
  symbolicLinks.forEach(({ from, to }) => {
    try {
      // Make sure source exists
      if (!fs.existsSync(from)) {
        console.log(`  ⚠️ Source file not found: ${from}`);
        return;
      }
      
      // Create directory if it doesn't exist
      const dir = path.dirname(to);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Remove destination if it exists
      if (fs.existsSync(to)) {
        fs.unlinkSync(to);
      }
      
      // Create symbolic link
      const relativePath = path.relative(path.dirname(to), from);
      fs.symlinkSync(relativePath, to);
      console.log(`  ${colors.green}✓ Created symbolic link: ${to} → ${from}${colors.reset}`);
    } catch (err) {
      console.error(`  ${colors.red}✗ Error creating symbolic link from ${from} to ${to}: ${err.message}${colors.reset}`);
    }
  });
  
  console.log('');
}

// Function to install necessary dependencies
function installDependencies() {
  console.log(`${colors.yellow}Installing necessary dependencies...${colors.reset}`);
  
  try {
    console.log('  Installing moti and react-native-reanimated for animations...');
    execSync('npm install moti react-native-reanimated expo-haptics --save', { stdio: 'inherit' });
    console.log(`  ${colors.green}✓ Dependencies installed successfully${colors.reset}`);
  } catch (err) {
    console.error(`  ${colors.red}✗ Error installing dependencies: ${err.message}${colors.reset}`);
  }
  
  console.log('');
}

// Function to update babel.config.js for Reanimated
function updateBabelConfig() {
  console.log(`${colors.yellow}Updating babel.config.js for Reanimated support...${colors.reset}`);
  
  const babelConfigPath = 'babel.config.js';
  
  try {
    if (fs.existsSync(babelConfigPath)) {
      let babelConfig = fs.readFileSync(babelConfigPath, 'utf8');
      
      if (!babelConfig.includes('react-native-reanimated/plugin')) {
        // Simple regex to find the plugins array
        const pluginsRegex = /plugins\s*:\s*\[([\s\S]*?)\]/;
        const match = babelConfig.match(pluginsRegex);
        
        if (match) {
          // Add reanimated plugin to the existing plugins array
          const updatedPlugins = match[0].replace(']', ", 'react-native-reanimated/plugin']");
          babelConfig = babelConfig.replace(pluginsRegex, updatedPlugins);
        } else {
          // If no plugins array found, create one with the reanimated plugin
          babelConfig = babelConfig.replace('module.exports = {', 'module.exports = {\n  plugins: ["react-native-reanimated/plugin"],');
        }
        
        fs.writeFileSync(babelConfigPath, babelConfig);
        console.log(`  ${colors.green}✓ Added react-native-reanimated plugin to babel.config.js${colors.reset}`);
      } else {
        console.log(`  ${colors.green}✓ react-native-reanimated plugin already in babel.config.js${colors.reset}`);
      }
    } else {
      console.log(`  ⚠️ babel.config.js not found, creating it`);
      const newBabelConfig = `module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin']
};`;
      fs.writeFileSync(babelConfigPath, newBabelConfig);
      console.log(`  ${colors.green}✓ Created babel.config.js with react-native-reanimated plugin${colors.reset}`);
    }
  } catch (err) {
    console.error(`  ${colors.red}✗ Error updating babel.config.js: ${err.message}${colors.reset}`);
  }
  
  console.log('');
}

// Create the fix-jsx script
function createFixJsxScript() {
  console.log(`${colors.yellow}Creating fix-jsx script...${colors.reset}`);
  
  const scriptPath = 'scripts/fix-jsx-in-js.js';
  const scriptDir = path.dirname(scriptPath);
  
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(scriptDir)) {
      fs.mkdirSync(scriptDir, { recursive: true });
    }
    
    const script = `const fs = require('fs');
const path = require('path');

// List of directories to scan
const dirsToScan = ['./src', './app'];

// Function to process a file
const processFile = (filePath) => {
  if (filePath.endsWith('.js') && !filePath.includes('node_modules')) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if the file contains JSX
      if ((content.includes('<') && content.includes('/>')) || content.includes('</')) {
        console.log(\`Converting \${filePath} to .jsx...\`);
        
        // Create a .jsx file with the same content
        const jsxPath = filePath.replace('.js', '.jsx');
        fs.writeFileSync(jsxPath, content);
        
        // Delete the original .js file
        fs.unlinkSync(filePath);
        
        console.log(\`✓ Converted \${filePath} to \${jsxPath}\`);
      }
    } catch (error) {
      console.error(\`Error processing \${filePath}: \${error.message}\`);
    }
  }
};

// Function to scan directories recursively
const scanDir = (dir) => {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory() && !filePath.includes('node_modules')) {
      scanDir(filePath);
    } else {
      processFile(filePath);
    }
  });
};

// Start scanning
console.log('Scanning for JS files with JSX...');
dirsToScan.forEach(scanDir);
console.log('JSX conversion completed!');`;

    fs.writeFileSync(scriptPath, script);
    console.log(`  ${colors.green}✓ Created fix-jsx script at ${scriptPath}${colors.reset}`);
    
    // Add to package.json scripts
    updatePackageJsonScripts();
  } catch (err) {
    console.error(`  ${colors.red}✗ Error creating fix-jsx script: ${err.message}${colors.reset}`);
  }
}

// Update package.json to add our scripts
function updatePackageJsonScripts() {
  console.log(`${colors.yellow}Updating package.json scripts...${colors.reset}`);
  
  try {
    const packageJsonPath = 'package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add our scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['fix-jsx'] = 'node ./scripts/fix-jsx-in-js.js';
      packageJson.scripts['clean-cache'] = 'expo start --clear';
      packageJson.scripts['clean-start'] = 'npm run clean-cache';
      
      // Write back to file
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`  ${colors.green}✓ Added scripts to package.json${colors.reset}`);
    } else {
      console.log(`  ⚠️ package.json not found`);
    }
  } catch (err) {
    console.error(`  ${colors.red}✗ Error updating package.json: ${err.message}${colors.reset}`);
  }
}

// Main function to run all tasks
function main() {
  try {
    removeRedundantFiles();
    renameFiles();
    createSymbolicLinks();
    installDependencies();
    updateBabelConfig();
    createFixJsxScript();
    
    console.log(`${colors.bright}${colors.green}Project optimization completed successfully!${colors.reset}`);
    console.log(`\nRun the following command to start the optimized project:`);
    console.log(`${colors.cyan}npx expo start --clear${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}An unexpected error occurred: ${err.message}${colors.reset}`);
  }
}

// Run the main function
main();
