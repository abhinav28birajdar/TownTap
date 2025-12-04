module.exports = function (api) {
  const isTest = api.env('test');
  
  // Only cache in test environment to avoid expo-router conflicts
  if (isTest) {
    api.cache(true);
    return {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
    };
  }
  
  // Don't use caching in development/production to avoid conflicts
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'
    ],
  };
};