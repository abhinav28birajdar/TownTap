module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { 
        jsxRuntime: 'automatic'
      }]
    ],
    plugins: [
      // React Native and JSX handling
      ['@babel/plugin-transform-react-jsx', {
        runtime: 'automatic'
      }],
      
      // Handle class properties and private methods
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      
      // TypeScript handling
      ['@babel/plugin-transform-typescript', { 
        allowDeclareFields: true,
        allowNamespaces: true,
        isTSX: true,
        onlyRemoveTypeImports: false
      }],
      
      // Animation support - Using reanimated
      'react-native-reanimated/plugin',
      
      // Enable path aliases
      ['module-resolver', {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@app': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@assets': './assets',
        },
      }],
    ],
    env: {
      production: {
        plugins: ['transform-remove-console']
      }
    }
  };
};
