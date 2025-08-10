// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Handle TypeScript paths and syntax
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'cjs', 'json'];

// Add path aliases
config.resolver.extraNodeModules = {
  '@app': path.resolve(__dirname, './src'),
  '@components': path.resolve(__dirname, './src/components'),
  '@screens': path.resolve(__dirname, './src/screens'),
  '@services': path.resolve(__dirname, './src/services'),
  '@utils': path.resolve(__dirname, './src/utils'),
  '@hooks': path.resolve(__dirname, './src/hooks'),
  '@assets': path.resolve(__dirname, './assets'),
};

module.exports = config;
