import { useColors } from '@/contexts/theme-context';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '../themed-text';

export function OfflineIndicator() {
  const colors = useColors();
  const [isOffline, setIsOffline] = useState(false);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOffline) {
      translateY.value = withSpring(0);
      opacity.value = withTiming(1);
    } else {
      translateY.value = withSpring(-100);
      opacity.value = withTiming(0);
    }
  }, [isOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.warning },
        animatedStyle,
      ]}
    >
      <ThemedText type="caption" style={{ color: '#FFFFFF' }}>
        ⚠️ No internet connection
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
