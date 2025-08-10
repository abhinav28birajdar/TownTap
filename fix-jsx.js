/**
 * This script finds and fixes JSX syntax in compiled JS files
 * by replacing JSX with React.createElement calls.
 */
const fs = require('fs');
const path = require('path');

// Log info
console.log('🔍 Scanning for JSX syntax in compiled JS files...');

// Specific files to check
const jsFiles = [
  'node_modules/expo-router/build/layouts/TabsClient.js',
  'node_modules/expo-router/build/link/Link.js',
  'node_modules/expo-router/build/layouts/DrawerClient.js',
  'node_modules/expo-router/build/layouts/ModalClient.js',
  'node_modules/expo-router/build/layouts/StackClient.js'
];

// Count for reporting
let filesFixed = 0;
let syntaxFixCount = 0;

jsFiles.forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${file}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip files that don't use JSX or already use React.createElement
  if (!content.includes('<') || !content.includes('</')) {
    console.log(`✓ No JSX found in ${file}`);
    return;
  }
  
  console.log(`Found potential JSX in ${file}`);
  
  // Create backup
  fs.writeFileSync(`${filePath}.bak`, content);
  
  // Replace JSX in TabsClient.js
  if (file.includes('TabsClient.js')) {
    const modified = content.replace(
      /const children = react_native_1\.Platform\.OS === 'web' \? props\.children : <react_native_1\.Pressable>{props\.children}<\/react_native_1\.Pressable>;/,
      `const children = react_native_1.Platform.OS === 'web' ? 
          props.children : 
          react_1.default.createElement(react_native_1.Pressable, null, props.children);`
    ).replace(
      /return \(<Link_1\.Link \{\.\.\.props\} style={\[{ display: 'flex' }, props\.style\]} href={href} asChild={react_native_1\.Platform\.OS !== 'web'} children={children}\/>\);/,
      `return react_1.default.createElement(Link_1.Link, 
          Object.assign({}, props, { 
              style: [{ display: 'flex' }, props.style], 
              href: href, 
              asChild: react_native_1.Platform.OS !== 'web',
              children: children 
          }));`
    );
    
    if (modified !== content) {
      console.log(`✅ Fixed JSX in ${file}`);
      fs.writeFileSync(filePath, modified);
      filesFixed++;
      syntaxFixCount++;
    }
  }
});

console.log(`✨ Finished scanning. Fixed JSX syntax in ${filesFixed} files with ${syntaxFixCount} replacements.`);
console.log('🚀 You can now restart the Metro bundler with: npx expo start --clear');
