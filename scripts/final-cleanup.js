/**
 * Final Project Cleanup Script
 * Removes all remaining duplicate and redundant files
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
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.blue}=== TownTap Final Cleanup ===${colors.reset}\n`);

// Files to remove completely
const filesToRemove = [
  // Duplicate SQL files
  'database_complete.sql',
  'DATABASE_SCHEMA.sql',
  'ENHANCED_TOWNTAP_COMPLETE_SCHEMA.sql',
  'FINAL_DATABASE_SCHEMA.sql',
  'TOWNTAP_COMPLETE_SCHEMA.sql',
  'TOWNTAP_DATABASE.sql',
  'TOWNTAP_FINAL_FIXED_SCHEMA.sql',
  
  // Redundant documentation
  'BUNDLING_FIX_SUCCESS.md',
  'README_NEW.md',
  'URGENT_FIX_GUIDE.md',
  'MAINTENANCE_TOOLS.md',
  'PR_MAINTENANCE_TOOLS.md',
  
  // Temporary/fix files
  'fix-jsx.js',
  'fix-type-syntax.js',
  'fixed-tabs-client.js',
  'expo-router-fix.ts',
  'index.js',
  'index.tsx',
  'patched-ErrorBoundary.tsx',
  'project-analyzer.js',
  'restore-config.js',
  'setup-expo-go.js',
  
  // Environment examples (keep only .env)
  '.env.example'
];

// Directories to check for empty files
const dirsToCheck = [
  'src',
  'app', 
  'components',
  'supabase'
];

let stats = {
  filesRemoved: 0,
  emptyFilesRemoved: 0,
  directoriesRemoved: 0
};

// Remove specific files
function removeFiles() {
  console.log(`${colors.cyan}Removing redundant files...${colors.reset}`);
  
  filesToRemove.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const stat = fs.statSync(file);
        fs.unlinkSync(file);
        console.log(`${colors.green}✓ Removed: ${file} (${(stat.size / 1024).toFixed(1)}KB)${colors.reset}`);
        stats.filesRemoved++;
      }
    } catch (err) {
      console.error(`${colors.red}✗ Error removing ${file}: ${err.message}${colors.reset}`);
    }
  });
}

// Find and remove empty files
function removeEmptyFiles() {
  console.log(`\n${colors.cyan}Scanning for empty files...${colors.reset}`);
  
  function scanDirectory(dir) {
    try {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and .git
          if (!item.includes('node_modules') && !item.includes('.git') && !item.includes('.expo')) {
            scanDirectory(itemPath);
            
            // Check if directory is now empty and remove it
            try {
              const remainingItems = fs.readdirSync(itemPath);
              if (remainingItems.length === 0) {
                fs.rmdirSync(itemPath);
                console.log(`${colors.yellow}✓ Removed empty directory: ${itemPath}${colors.reset}`);
                stats.directoriesRemoved++;
              }
            } catch (e) {
              // Directory not empty or can't be removed, that's fine
            }
          }
        } else if (stat.isFile() && stat.size === 0) {
          fs.unlinkSync(itemPath);
          console.log(`${colors.green}✓ Removed empty file: ${itemPath}${colors.reset}`);
          stats.emptyFilesRemoved++;
        }
      }
    } catch (err) {
      console.error(`${colors.red}Error scanning ${dir}: ${err.message}${colors.reset}`);
    }
  }
  
  // Scan specified directories
  dirsToCheck.forEach(dir => scanDirectory(dir));
  
  // Also scan root for empty files
  try {
    const rootItems = fs.readdirSync('.');
    rootItems.forEach(item => {
      if (item.endsWith('.md') || item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.tsx')) {
        const stat = fs.statSync(item);
        if (stat.isFile() && stat.size === 0) {
          fs.unlinkSync(item);
          console.log(`${colors.green}✓ Removed empty file: ${item}${colors.reset}`);
          stats.emptyFilesRemoved++;
        }
      }
    });
  } catch (err) {
    console.error(`${colors.red}Error scanning root: ${err.message}${colors.reset}`);
  }
}

// Consolidate remaining duplicate files
function consolidateDuplicates() {
  console.log(`\n${colors.cyan}Consolidating remaining files...${colors.reset}`);
  
  // If we still have both database.sql and database_complete.sql, keep the larger one
  try {
    const hasDatabase = fs.existsSync('database.sql');
    const hasDatabaseComplete = fs.existsSync('database_complete.sql');
    
    if (hasDatabase && hasDatabaseComplete) {
      const dbStat = fs.statSync('database.sql');
      const dbCompleteStat = fs.statSync('database_complete.sql');
      
      if (dbCompleteStat.size > dbStat.size) {
        fs.unlinkSync('database.sql');
        fs.renameSync('database_complete.sql', 'database.sql');
        console.log(`${colors.green}✓ Consolidated: database_complete.sql → database.sql${colors.reset}`);
      } else {
        fs.unlinkSync('database_complete.sql');
        console.log(`${colors.green}✓ Kept: database.sql (larger file)${colors.reset}`);
      }
    }
  } catch (err) {
    console.error(`${colors.red}Error consolidating database files: ${err.message}${colors.reset}`);
  }
  
  // Move components from root to src if they exist
  try {
    if (fs.existsSync('components') && fs.existsSync('src/components')) {
      const rootComponents = fs.readdirSync('components');
      
      for (const component of rootComponents) {
        const srcPath = path.join('components', component);
        const destPath = path.join('src/components', component);
        
        if (!fs.existsSync(destPath)) {
          fs.renameSync(srcPath, destPath);
          console.log(`${colors.green}✓ Moved: ${srcPath} → ${destPath}${colors.reset}`);
        } else {
          fs.unlinkSync(srcPath);
          console.log(`${colors.yellow}✓ Removed duplicate: ${srcPath}${colors.reset}`);
        }
      }
      
      // Remove empty components directory
      try {
        fs.rmdirSync('components');
        console.log(`${colors.green}✓ Removed empty directory: components${colors.reset}`);
        stats.directoriesRemoved++;
      } catch (e) {
        // Directory not empty, that's fine
      }
    }
  } catch (err) {
    console.error(`${colors.red}Error moving components: ${err.message}${colors.reset}`);
  }
}

// Create a project status report
function createStatusReport() {
  console.log(`\n${colors.cyan}Creating project status report...${colors.reset}`);
  
  const report = `# TownTap Project Status Report
Generated: ${new Date().toISOString()}

## Cleanup Summary
- Files removed: ${stats.filesRemoved}
- Empty files removed: ${stats.emptyFilesRemoved}
- Empty directories removed: ${stats.directoriesRemoved}

## Current Project Structure
\`\`\`
TownTap/
├── src/                    # Main source code
│   ├── components/         # React components
│   ├── screens/            # App screens
│   ├── services/           # Business logic
│   ├── hooks/              # Custom hooks
│   ├── navigation/         # Navigation setup
│   ├── context/            # React context
│   ├── theme/              # Theme configuration
│   ├── stores/             # State management
│   └── types/              # TypeScript types
├── app/                    # Expo Router pages
├── assets/                 # Static assets
├── scripts/                # Utility scripts
├── database.sql            # Complete database schema
├── package.json            # Dependencies
├── babel.config.js         # Babel configuration
└── README.md               # Project documentation
\`\`\`

## Key Files
- **database.sql**: Complete PostgreSQL schema for Supabase
- **src/**: All source code organized by feature
- **scripts/**: Utility scripts for development
- **babel.config.js**: Optimized with path aliases and reanimated support

## Next Steps
1. Run \`npm install\` to ensure all dependencies are installed
2. Run \`npm run clean-start\` to start with a clean cache
3. Test the application to ensure all features work
4. Deploy to Supabase using the database.sql file

## Scripts Available
- \`npm start\` - Start the development server
- \`npm run clean-start\` - Start with clean cache
- \`npm run fix-jsx\` - Fix JSX issues in node_modules
- \`npm run cleanup\` - Run project cleanup
- \`npm run optimize\` - Run project optimization
`;

  try {
    fs.writeFileSync('PROJECT_STATUS.md', report);
    console.log(`${colors.green}✓ Created: PROJECT_STATUS.md${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}Error creating status report: ${err.message}${colors.reset}`);
  }
}

// Main execution
function main() {
  removeFiles();
  removeEmptyFiles();
  consolidateDuplicates();
  createStatusReport();
  
  console.log(`\n${colors.bright}${colors.green}=== Final Cleanup Complete ===${colors.reset}`);
  console.log(`${colors.green}✓ Removed ${stats.filesRemoved} redundant files${colors.reset}`);
  console.log(`${colors.green}✓ Removed ${stats.emptyFilesRemoved} empty files${colors.reset}`);
  console.log(`${colors.green}✓ Removed ${stats.directoriesRemoved} empty directories${colors.reset}`);
  console.log(`\n${colors.cyan}Project is now clean and optimized!${colors.reset}`);
  console.log(`${colors.cyan}Check PROJECT_STATUS.md for details.${colors.reset}`);
}

main();
