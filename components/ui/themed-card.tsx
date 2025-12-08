import { BorderRadius, Shadows } from '@/constants/theme';
import { useColors } from '@/contexts/theme-context';
import React, { memo } from 'react';
import { Pressable, PressableProps, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface ThemedCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ThemedCard = memo(({
  children,
  variant = 'elevated',
  padding = 16,
  onPress,
  style,
  ...props
}: ThemedCardProps) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          borderWidth: 0,
          ...Shadows.medium,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        };
      case 'filled':
        return {
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 0,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const Component = onPress ? AnimatedPressable : View;

  return (
    <Component
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        variantStyles,
        { padding },
        onPress && animatedStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </Component>
  );
});

ThemedCard.displayName = 'ThemedCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});
