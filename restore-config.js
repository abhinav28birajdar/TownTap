// Script to restore original project configuration
const fs = require('fs');
const path = require('path');

console.log('Restoring original project configuration...');

const packageJsonPath = path.join(__dirname, 'package.json');
const backupPath = packageJsonPath + '.backup';

if (fs.existsSync(backupPath)) {
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(packageJsonPath, backupContent);
  fs.unlinkSync(backupPath);
  console.log('✅ Original configuration restored!');
  console.log('🔄 Run: npm install');
} else {
  console.log('❌ No backup found!');
}
