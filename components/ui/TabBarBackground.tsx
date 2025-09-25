import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../src/context/ModernThemeContext';

interface TabBarBackgroundProps {
  style?: ViewStyle;
}

const TabBarBackground: React.FC<TabBarBackgroundProps> = ({ style }) => {
  const { isDark } = useTheme();

  return (
    <View style={[{ flex: 1 }, style]}>
      <BlurView
        intensity={100}
        tint={isDark ? 'dark' : 'light'}
        style={{
          flex: 1,
          backgroundColor: isDark 
            ? 'rgba(0, 0, 0, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
        }}
      />
    </View>
  );
};

export default TabBarBackground;