#!/usr/bin/env node

/**
 * TownTap Project Analyzer and Fixer
 * 
 * This script analyzes the entire TownTap project, checks for issues,
 * and applies fixes to ensure the project runs correctly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 TOWNTAP PROJECT ANALYZER');
console.log('=========================');

// Project root
const projectRoot = process.cwd();

// Analysis results
const issues = {
  reactNative: [],
  database: [],
  environment: [],
  dependencies: [],
  jsxSyntax: [],
  nodeModules: []
};

/**
 * Check for environment variables
 */
function checkEnvironment() {
  console.log('\n🔎 Checking environment variables...');
  
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    issues.environment.push('Missing .env file');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('EXPO_PUBLIC_SUPABASE_URL') || !envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY')) {
    issues.environment.push('Missing Supabase credentials in .env file');
  }
}

/**
 * Check for JSX syntax issues in built JS files
 */
function checkJsxSyntaxInBuiltFiles() {
  console.log('\n🔎 Checking for JSX syntax issues in built files...');
  
  const problematicFiles = [
    'node_modules/expo-router/build/layouts/TabsClient.js',
    'node_modules/expo-router/build/link/Link.js',
    'node_modules/expo-router/build/layouts/DrawerClient.js',
  ];
  
  for (const file of problematicFiles) {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('<') && content.includes('</') && !content.includes('createElement(')) {
      issues.jsxSyntax.push(file);
    }
  }
}

/**
 * Fix JSX syntax issues
 */
function fixJsxSyntaxIssues() {
  console.log('\n🛠 Fixing JSX syntax issues...');
  
  const tabsClientPath = path.join(projectRoot, 'node_modules/expo-router/build/layouts/TabsClient.js');
  
  if (fs.existsSync(tabsClientPath)) {
    let content = fs.readFileSync(tabsClientPath, 'utf8');
    
    // Create backup
    fs.writeFileSync(`${tabsClientPath}.bak`, content);
    
    if (content.includes('<react_native_1.Pressable>')) {
      content = content.replace(
        /const children = react_native_1\.Platform\.OS === 'web' \? props\.children : <react_native_1\.Pressable>{props\.children}<\/react_native_1\.Pressable>;/g,
        `const children = react_native_1.Platform.OS === 'web' ? 
            props.children : 
            react_1.default.createElement(react_native_1.Pressable, null, props.children);`
      );
      
      content = content.replace(
        /return \(<Link_1\.Link \{\.\.\.props\} style={\[{ display: 'flex' }, props\.style\]} href={href} asChild={react_native_1\.Platform\.OS !== 'web'} children={children}\/>\);/g,
        `return react_1.default.createElement(Link_1.Link, 
            Object.assign({}, props, { 
                style: [{ display: 'flex' }, props.style], 
                href: href, 
                asChild: react_native_1.Platform.OS !== 'web',
                children: children 
            }));`
      );
      
      fs.writeFileSync(tabsClientPath, content);
      console.log('✅ Fixed JSX syntax in TabsClient.js');
    }
  }
}

/**
 * Check project structure for redundant files
 */
function checkProjectStructure() {
  console.log('\n🔎 Checking project structure...');
  
  // Check for duplicate files
  const typesDirPath = path.join(projectRoot, 'src/types');
  if (fs.existsSync(typesDirPath)) {
    const typesFiles = fs.readdirSync(typesDirPath);
    
    if (typesFiles.includes('index.ts') && typesFiles.includes('index_new.ts')) {
      issues.database.push('Duplicate index files in types directory');
    }
    
    if (typesFiles.includes('index_location.ts') && typesFiles.includes('index.ts')) {
      issues.database.push('Separate location types file that might be merged');
    }
  }
}

/**
 * Fix any database schema issues
 */
function fixDatabaseSchema() {
  console.log('\n🛠 Enhancing database schema...');
  
  const databasePath = path.join(projectRoot, 'src/types/database.ts');
  if (fs.existsSync(databasePath)) {
    const content = fs.readFileSync(databasePath, 'utf8');
    
    // Check if the schema is already enhanced
    if (!content.includes('CompleteOrder')) {
      const enhancedContent = content.replace(
        /\/\/ Helper Types/,
        `// Helper Types
// Enhanced composite types for application use

/**
 * Complete order with items
 * Combines order and related order items
 */
export interface CompleteOrder extends Order {
  items: OrderItem[];
  business?: Business;
  customer?: Profile;
}

/**
 * Business with category information
 * Combines business and its primary category
 */
export interface BusinessWithCategory extends Business {
  category: Category;
  distance_km?: number;
}

/**
 * Product with business information
 * Combines product and its parent business
 */
export interface ProductWithBusiness extends Product {
  business: Business;
}`
      );
      
      fs.writeFileSync(databasePath, enhancedContent);
      console.log('✅ Enhanced database schema with composite types');
    }
  }
}

/**
 * Consolidate types files
 */
function consolidateTypesFiles() {
  console.log('\n🛠 Consolidating types files...');
  
  const typesDirPath = path.join(projectRoot, 'src/types');
  if (fs.existsSync(typesDirPath)) {
    // Check for duplicate index files
    const indexPath = path.join(typesDirPath, 'index.ts');
    const indexNewPath = path.join(typesDirPath, 'index_new.ts');
    const indexLocationPath = path.join(typesDirPath, 'index_location.ts');
    
    if (fs.existsSync(indexPath) && fs.existsSync(indexNewPath)) {
      // Merge the files
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const indexNewContent = fs.readFileSync(indexNewPath, 'utf8');
      
      // Create a backup
      fs.writeFileSync(`${indexPath}.bak`, indexContent);
      
      // Merge content (basic approach)
      const mergedContent = `// Consolidated types from multiple files
${indexContent}

// Additional types from index_new.ts
${indexNewContent}`;
      
      fs.writeFileSync(indexPath, mergedContent);
      console.log('✅ Merged index.ts and index_new.ts');
    }
    
    if (fs.existsSync(indexPath) && fs.existsSync(indexLocationPath)) {
      // Merge location types
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const locationContent = fs.readFileSync(indexLocationPath, 'utf8');
      
      // Create a backup
      fs.writeFileSync(`${indexPath}.bak2`, indexContent);
      
      // Merge content (basic approach)
      const mergedContent = `// Consolidated types including location types
${indexContent}

// Location types from index_location.ts
${locationContent}`;
      
      fs.writeFileSync(indexPath, mergedContent);
      console.log('✅ Merged index.ts and index_location.ts');
    }
  }
}

/**
 * Check for app entry point issues
 */
function checkAppEntryPoint() {
  console.log('\n🔎 Checking app entry point...');
  
  // Check App.tsx for proper setup
  const appPath = path.join(projectRoot, 'App.tsx');
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    if (!appContent.includes('SplashScreen.preventAutoHideAsync')) {
      issues.reactNative.push('SplashScreen not properly configured in App.tsx');
    }
    
    if (!appContent.includes('initialize') && appContent.includes('useAuthActions')) {
      issues.reactNative.push('Auth initialization might be missing in App.tsx');
    }
  }
}

/**
 * Run the analyzer and fix issues
 */
function run() {
  console.log('Starting TownTap project analysis...');
  
  checkEnvironment();
  checkJsxSyntaxInBuiltFiles();
  checkProjectStructure();
  checkAppEntryPoint();
  
  // Display all issues
  console.log('\n📋 ANALYSIS RESULTS:');
  let totalIssues = 0;
  
  for (const [category, categoryIssues] of Object.entries(issues)) {
    if (categoryIssues.length > 0) {
      console.log(`\n${category.toUpperCase()} ISSUES:`);
      categoryIssues.forEach((issue, index) => {
        console.log(`  ${index+1}. ${issue}`);
      });
      totalIssues += categoryIssues.length;
    }
  }
  
  if (totalIssues === 0) {
    console.log('✅ No issues found! Your project looks good.');
    return;
  }
  
  // Fix issues
  console.log('\n🛠 FIXING ISSUES:');
  
  if (issues.jsxSyntax.length > 0) {
    fixJsxSyntaxIssues();
  }
  
  if (issues.database.length > 0) {
    fixDatabaseSchema();
    consolidateTypesFiles();
  }
  
  console.log('\n✅ FIXES APPLIED');
  console.log('Restart the Expo development server with: npx expo start --clear');
}

// Run the analysis
run();
