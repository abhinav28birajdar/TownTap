module.exports = function (api) {
  api.cache(true);
  
  const isTest = api.env('test');
  
  if (isTest) {
    return {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
    };
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'
    ],
  };
};