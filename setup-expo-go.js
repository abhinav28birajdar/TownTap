// Script to temporarily configure project for Expo Go compatibility
const fs = require('fs');
const path = require('path');

console.log('Setting up project for Expo Go compatibility...');

// Read package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Create backup
fs.writeFileSync(packageJsonPath + '.backup', JSON.stringify(packageJson, null, 2));

// Remove expo-dev-client temporarily
if (packageJson.dependencies['expo-dev-client']) {
  delete packageJson.dependencies['expo-dev-client'];
  console.log('✓ Removed expo-dev-client dependency');
}

// Fix React Navigation versions for Expo SDK 53
const navigationUpdates = {
  '@react-navigation/drawer': '^6.6.15',
  '@react-navigation/bottom-tabs': '^6.5.20',
  '@react-navigation/elements': '^1.3.30',
  '@react-navigation/native': '^6.1.17',
  '@react-navigation/native-stack': '^6.9.26',
  '@react-navigation/stack': '^6.3.29'
};

Object.keys(navigationUpdates).forEach(dep => {
  if (packageJson.dependencies[dep]) {
    packageJson.dependencies[dep] = navigationUpdates[dep];
    console.log(`✓ Updated ${dep} to ${navigationUpdates[dep]}`);
  }
});

// Remove problematic dependencies temporarily
const problemDeps = ['expo-av', 'expo-camera', 'expo-blur'];
problemDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    console.log(`✓ Temporarily removed ${dep}`);
  }
});

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('\n✅ Project configured for Expo Go!');
console.log('📱 Now you can:');
console.log('1. Install Expo Go app from Play Store/App Store');
console.log('2. Run: npm install');
console.log('3. Run: npx expo start');
console.log('4. Scan QR code with Expo Go app');
console.log('\n💡 To restore original config: node restore-config.js');
