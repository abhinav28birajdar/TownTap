/**
 * Enhanced TownTap Type Syntax Fixer
 * This script fixes TypeScript syntax issues in node_modules that cause bundling errors.
 */

const fs = require('fs');
const path = require('path');

// Files that need fixing
const FILES_TO_FIX = [
  {
    path: 'node_modules/expo/src/launch/registerRootComponent.tsx',
    fixes: [
      {
        find: "import { type ComponentType } from 'react';",
        replace: "import React, { ComponentType } from 'react';"
      },
      {
        find: "import { AppRegistry } from 'react-native';",
        replace: "import { AppRegistry, Platform } from 'react-native';"
      }
    ]
  },
  {
    // Other potential files with type import issues
    path: 'node_modules/expo/AppEntry.js',
    fixes: [
      {
        find: "import { registerRootComponent } from 'expo';",
        replace: "import registerRootComponent from 'expo/src/launch/registerRootComponent';"
      }
    ]
  },
  // Can add more problematic files here
];

console.log('🔧 TownTap Type Syntax Fixer');
console.log('🔍 Scanning for TypeScript syntax issues...');

// Process each file
FILES_TO_FIX.forEach(file => {
  const filePath = path.resolve(process.cwd(), file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${file.path}`);
    return;
  }
  
  // Create backup if it doesn't exist
  const backupPath = `${filePath}.bak`;
  if (!fs.existsSync(backupPath)) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, originalContent, 'utf8');
      console.log(`✅ Backup created: ${file.path}.bak`);
    } catch (error) {
      console.error(`❌ Error creating backup for ${file.path}:`, error);
      return;
    }
  }
  
  // Apply fixes
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    file.fixes.forEach(fix => {
      if (content.includes(fix.find)) {
        content = content.replace(fix.find, fix.replace);
        modified = true;
        console.log(`✅ Fixed in ${file.path}: "${fix.find}" -> "${fix.replace}"`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`💾 Saved changes to ${file.path}`);
    } else {
      console.log(`ℹ️ No issues found in ${file.path}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file.path}:`, error);
  }
});

// Apply the patched registerRootComponent if available
const patchedPath = path.resolve(__dirname, 'patched-registerRootComponent.tsx');
const targetPath = path.resolve(__dirname, 'node_modules/expo/src/launch/registerRootComponent.tsx');

if (fs.existsSync(patchedPath)) {
  try {
    const patchedContent = fs.readFileSync(patchedPath, 'utf8');
    fs.writeFileSync(targetPath, patchedContent, 'utf8');
    console.log('✅ Applied patch from patched-registerRootComponent.tsx');
  } catch (error) {
    console.error('❌ Error applying patched file:', error);
  }
}

console.log('✨ TypeScript syntax fix completed!');
console.log('� Please restart your Expo bundler with: npx expo start --clear');
