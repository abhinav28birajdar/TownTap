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
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

console.log(`${colors.bright}${colors.magenta}
╔════════════════════════════════════════════════╗
║                                                ║
║  TownTap - Complete Project Setup & Optimizer  ║
║                                                ║
╚════════════════════════════════════════════════╝${colors.reset}
`);

// Function to run script with proper error handling
function runScript(scriptPath, description) {
  console.log(`\n${colors.bright}${colors.cyan}== ${description} ==${colors.reset}\n`);
  
  try {
    if (fs.existsSync(scriptPath)) {
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
      return true;
    } else {
      console.error(`${colors.yellow}⚠️ Script not found: ${scriptPath}${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}✗ Error running ${scriptPath}: ${err.message}${colors.reset}`);
    return false;
  }
}

// Function to install dependencies
function installDependencies() {
  console.log(`\n${colors.bright}${colors.cyan}== Installing Dependencies ==${colors.reset}\n`);
  
  try {
    console.log(`${colors.yellow}Installing required packages...${colors.reset}`);
    execSync('npm install moti react-native-reanimated@~2.14.0 expo-haptics --save', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Dependencies installed successfully${colors.reset}`);
    return true;
  } catch (err) {
    console.error(`${colors.red}✗ Error installing dependencies: ${err.message}${colors.reset}`);
    return false;
  }
}

// Function to create a batch file for Windows users
function createBatchFile() {
  console.log(`\n${colors.bright}${colors.cyan}== Creating Quick Start Batch File ==${colors.reset}\n`);
  
  const batchContent = `@echo off
echo Starting TownTap with clean cache...
npx expo start --clear
`;

  try {
    fs.writeFileSync('start-towntap.bat', batchContent);
    console.log(`${colors.green}✓ Created start-towntap.bat${colors.reset}`);
    return true;
  } catch (err) {
    console.error(`${colors.red}✗ Error creating batch file: ${err.message}${colors.reset}`);
    return false;
  }
}

// Function to create a shell script for Unix users
function createShellScript() {
  console.log(`\n${colors.bright}${colors.cyan}== Creating Quick Start Shell Script ==${colors.reset}\n`);
  
  const shellContent = `#!/bin/bash
echo "Starting TownTap with clean cache..."
npx expo start --clear
`;

  try {
    fs.writeFileSync('start-towntap.sh', shellContent);
    // Make the shell script executable
    try {
      execSync('chmod +x start-towntap.sh', { stdio: 'inherit' });
    } catch (e) {
      console.log(`${colors.yellow}⚠️ Could not make script executable. You may need to run: chmod +x start-towntap.sh${colors.reset}`);
    }
    console.log(`${colors.green}✓ Created start-towntap.sh${colors.reset}`);
    return true;
  } catch (err) {
    console.error(`${colors.red}✗ Error creating shell script: ${err.message}${colors.reset}`);
    return false;
  }
}

// Function to update package.json scripts
function updatePackageJsonScripts() {
  console.log(`\n${colors.bright}${colors.cyan}== Updating Package.json Scripts ==${colors.reset}\n`);
  
  try {
    const packageJsonPath = 'package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add our scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['fix-jsx'] = 'node ./scripts/fix-jsx-in-js.js';
      packageJson.scripts['fix-theme'] = 'node ./scripts/fix-theme-references.js';
      packageJson.scripts['optimize'] = 'node ./scripts/optimize-project.js';
      packageJson.scripts['clean-cache'] = 'expo start --clear';
      packageJson.scripts['clean-start'] = 'npm run clean-cache';
      packageJson.scripts['setup'] = 'node ./scripts/project-setup.js';
      
      // Write back to file
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`${colors.green}✓ Added scripts to package.json${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️ package.json not found${colors.reset}`);
      return false;
    }
  } catch (err) {
    console.error(`${colors.red}✗ Error updating package.json: ${err.message}${colors.reset}`);
    return false;
  }
}

// Main function to run all tasks
async function main() {
  let success = true;
  
  // First, run project optimization script if it exists
  if (fs.existsSync('scripts/optimize-project.js')) {
    success = runScript('scripts/optimize-project.js', 'Optimizing Project Structure') && success;
  }
  
  // Then run the theme reference fixer
  if (fs.existsSync('scripts/fix-theme-references.js')) {
    success = runScript('scripts/fix-theme-references.js', 'Fixing Theme References') && success;
  }
  
  // Install dependencies
  success = installDependencies() && success;
  
  // Create helper scripts
  createBatchFile();
  createShellScript();
  
  // Update package.json scripts
  updatePackageJsonScripts();
  
  if (success) {
    console.log(`\n${colors.bright}${colors.green}✓ TownTap setup completed successfully!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️ TownTap setup completed with some warnings/errors.${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}${colors.cyan}To start the app, run:${colors.reset}`);
  console.log(`${colors.cyan}npx expo start --clear${colors.reset}`);
  console.log(`${colors.cyan}or use one of the quick start scripts:${colors.reset}`);
  console.log(`${colors.cyan}start-towntap.bat${colors.reset} (Windows)`);
  console.log(`${colors.cyan}./start-towntap.sh${colors.reset} (Mac/Linux)`);
  
  console.log(`\n${colors.bright}${colors.cyan}For more information:${colors.reset}`);
  console.log(`${colors.cyan}See OPTIMIZATION_GUIDE.md for details on what was changed${colors.reset}`);
}

// Run the main function
main();
