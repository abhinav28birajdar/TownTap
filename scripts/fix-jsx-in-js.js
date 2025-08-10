const fs = require('fs');
const path = require('path');

/**
 * Enhanced JSX syntax fixer for JavaScript files
 * Handles complex JSX patterns and ensures React.createElement conversion
 */

function fixJsxInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;

    // Ensure React is available
    if (content.includes('React.createElement') && !content.includes('const React =')) {
      // Check if react is imported
      if (content.includes('const react_1 = require("react")')) {
        content = content.replace(
          'const react_1 = require("react");',
          'const react_1 = require("react");\nconst React = react_1.default;'
        );
        modified = true;
      } else if (content.includes('const react_1 = __importStar(require("react"))')) {
        content = content.replace(
          'const react_1 = __importStar(require("react"));',
          'const react_1 = __importStar(require("react"));\nconst React = react_1.default;'
        );
        modified = true;
      } else if (content.includes('const react_1 = __importDefault(require("react"))')) {
        content = content.replace(
          'const react_1 = __importDefault(require("react"));',
          'const react_1 = __importDefault(require("react"));\nconst React = react_1.default;'
        );
        modified = true;
      }
    }

    // Fix JSX patterns
    const jsxPatterns = [
      // Multi-line JSX with props - most complex first
      {
        regex: /return \(\s*<([A-Z][A-Za-z0-9_$.]*(?:\.[A-Z][A-Za-z0-9_$]*)*)\s+([^>]+)>\s*([^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*)\s*<\/\1>\s*\)/gs,
        replacement: (match, component, props, children) => {
          const propsObj = parsePropsAdvanced(props);
          const childrenFormatted = children.trim() ? `, ${children.trim()}` : '';
          return `return React.createElement(${component}, ${propsObj}${childrenFormatted})`;
        }
      },
      // Self-closing tags with props
      {
        regex: /return \(\s*<([A-Z][A-Za-z0-9_$.]*(?:\.[A-Z][A-Za-z0-9_$]*)*)\s+([^>\/]+)\s*\/>\s*\)/gs,
        replacement: (match, component, props) => {
          const propsObj = parsePropsAdvanced(props);
          return `return React.createElement(${component}, ${propsObj})`;
        }
      },
      // Simple JSX with children
      {
        regex: /return \(\s*<([A-Z][A-Za-z0-9_$.]*(?:\.[A-Z][A-Za-z0-9_$]*)*)\s*>\s*([^<]*)\s*<\/\1>\s*\)/gs,
        replacement: (match, component, children) => {
          const childrenFormatted = children.trim() ? `, ${children.trim()}` : '';
          return `return React.createElement(${component}, null${childrenFormatted})`;
        }
      },
      // Simple self-closing tags
      {
        regex: /return \(\s*<([A-Z][A-Za-z0-9_$.]*(?:\.[A-Z][A-Za-z0-9_$]*)*)\s*\/>\s*\)/gs,
        replacement: 'return React.createElement($1, null)'
      },
      // Inline JSX expressions
      {
        regex: /<([A-Z][A-Z-a-z0-9_$.]*(?:\.[A-Z][A-Za-z0-9_$]*)*)\s+([^>\/]+)\s*\/>/g,
        replacement: (match, component, props) => {
          const propsObj = parsePropsAdvanced(props);
          return `React.createElement(${component}, ${propsObj})`;
        }
      },
      // Simple inline JSX
      {
        regex: /<([A-Z][A-Za-z0-9_$.]*(?:\.[A-Z][A-Za-z0-9_$]*)*)\s*\/>/g,
        replacement: 'React.createElement($1, null)'
      },
      // JSX with children (inline)
      {
        regex: /<([A-Z][A-Za-z0-9_$.]*(?:\.[A-Z][A-Za-z0-9_$]*)*)\s*>([^<]*)<\/\1>/g,
        replacement: (match, component, children) => {
          const childrenFormatted = children.trim() ? `, ${children.trim()}` : '';
          return `React.createElement(${component}, null${childrenFormatted})`;
        }
      },
      // JSX with props and children (inline)
      {
        regex: /<([A-Z][A-Za-z0-9_$.]*(?:\.[A-Z][A-Za-z0-9_$]*)*)\s+([^>]+)>([^<]*)<\/\1>/g,
        replacement: (match, component, props, children) => {
          const propsObj = parsePropsAdvanced(props);
          const childrenFormatted = children.trim() ? `, ${children.trim()}` : '';
          return `React.createElement(${component}, ${propsObj}${childrenFormatted})`;
        }
      }
    ];

    jsxPatterns.forEach(pattern => {
      const beforeReplace = content;
      if (typeof pattern.replacement === 'function') {
        content = content.replace(pattern.regex, pattern.replacement);
      } else {
        content = content.replace(pattern.regex, pattern.replacement);
      }
      if (content !== beforeReplace) {
        modified = true;
      }
    });

    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed JSX in: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing JSX in ${filePath}:`, error.message);
    return false;
  }
}

function parsePropsAdvanced(propsString) {
  if (!propsString || !propsString.trim()) {
    return 'null';
  }

  try {
    // Handle spread operators and complex props
    if (propsString.includes('...')) {
      // For complex props with spreads, try to format them properly
      const parts = propsString.split(/(\.\.\.[^,\s}]+)/);
      const formattedParts = parts.map(part => {
        if (part.startsWith('...')) {
          return part;
        } else {
          return parseSimpleProps(part);
        }
      }).filter(part => part.trim());
      
      if (formattedParts.length > 0) {
        return `{ ${formattedParts.join(', ')} }`;
      }
    }
    
    return parseSimpleProps(propsString) || 'null';
  } catch {
    // Fallback for complex props
    return `{ ${propsString.trim()} }`;
  }
}

function parseSimpleProps(propsString) {
  if (!propsString || !propsString.trim()) {
    return '';
  }

  try {
    const props = [];
    // Simple prop parser for basic key={value} and key="value" patterns
    const propRegex = /(\w+)=(?:\{([^}]+)\}|"([^"]+)"|'([^']+)')/g;
    let match;
    
    while ((match = propRegex.exec(propsString)) !== null) {
      const [, key, jsValue, stringValue1, stringValue2] = match;
      if (jsValue) {
        props.push(`${key}: ${jsValue}`);
      } else if (stringValue1) {
        props.push(`${key}: "${stringValue1}"`);
      } else if (stringValue2) {
        props.push(`${key}: '${stringValue2}'`);
      }
    }
    
    return props.length > 0 ? props.join(', ') : '';
  } catch {
    return propsString.trim();
  }
}

function scanAndFixDirectory(dirPath) {
  let fixedCount = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        fixedCount += scanAndFixDirectory(itemPath);
      } else if (item.endsWith('.js') && !item.endsWith('.config.js') && !item.includes('.min.')) {
        if (fixJsxInFile(itemPath)) {
          fixedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dirPath}:`, error.message);
  }
  
  return fixedCount;
}

// Main execution
const targetDirectories = [
  'node_modules/expo-router/build',
  'node_modules/@react-navigation',
  'node_modules/expo/build'
];

console.log('🔧 Enhanced JSX syntax fixer starting...\n');

let totalFixed = 0;
targetDirectories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Scanning: ${dir}`);
    const fixed = scanAndFixDirectory(fullPath);
    totalFixed += fixed;
    console.log(`   Fixed ${fixed} files\n`);
  } else {
    console.log(`⚠️  Directory not found: ${dir}\n`);
  }
});

console.log(`✨ Total files fixed: ${totalFixed}`);

if (totalFixed > 0) {
  console.log('\n🎉 Enhanced JSX syntax fixes completed!');
  console.log('💡 Restart your development server to see the changes.');
  console.log('🔧 If issues persist, run: npm run clean-start');
} else {
  console.log('\n✅ No JSX syntax issues found.');
}
