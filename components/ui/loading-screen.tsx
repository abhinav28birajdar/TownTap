import { MotiView } from 'moti';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { Spacing } from '../../constants/spacing';
import { getThemeColors, useTheme } from '../../hooks/use-theme';
import { Text } from './Text';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  style,
  fullScreen = true,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const containerStyle = fullScreen ? styles.fullScreen : styles.container;
  
  return (
    <View style={[
      containerStyle,
      { backgroundColor: colors.background },
      style
    ]}>
      <MotiView
        from={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          type: 'timing',
          duration: 300,
        }}
        style={styles.content}
      >
        {/* Animated Loading Dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <MotiView
              key={index}
              from={{
                opacity: 0.3,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                type: 'timing',
                duration: 600,
                delay: index * 200,
                loop: true,
                repeatReverse: true,
              }}
              style={[
                styles.dot,
                { backgroundColor: colors.primary }
              ]}
            />
          ))}
        </View>
        
        {message && (
          <MotiView
            from={{
              opacity: 0,
              translateY: 20,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              type: 'timing',
              duration: 400,
              delay: 200,
            }}
          >
            <Text
              variant="body-large"
              style={{
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              {message}
            </Text>
          </MotiView>
        )}
      </MotiView>
    </View>
  );
};

// Skeleton Loading Component
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  return (
    <MotiView
      from={{
        opacity: 1,
      }}
      animate={{
        opacity: 0.5,
      }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
        repeatReverse: true,
      }}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.muted,
        },
        style,
      ]}
    />
  );
};

// Skeleton Card Component
export const SkeletonCard: React.FC = () => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  return (
    <View style={[
      styles.skeletonCard,
      { backgroundColor: colors.card }
    ]}>
      <View style={styles.skeletonHeader}>
        <Skeleton
          width={40}
          height={40}
          borderRadius={20}
          style={styles.skeletonAvatar}
        />
        <View style={styles.skeletonHeaderText}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      
      <Skeleton width="100%" height={120} style={styles.skeletonContent} />
      
      <View style={styles.skeletonFooter}>
        <Skeleton width="30%" height={14} />
        <Skeleton width="20%" height={14} />
      </View>
    </View>
  );
};

// List Skeleton Component
interface SkeletonListProps {
  count?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
}) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

// Spinner Component
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color,
  style,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const spinnerSize = {
    sm: 20,
    md: 32,
    lg: 48,
  }[size];
  
  return (
    <MotiView
      from={{
        rotate: '0deg',
      }}
      animate={{
        rotate: '360deg',
      }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
      }}
      style={[
        {
          width: spinnerSize,
          height: spinnerSize,
          borderWidth: 2,
          borderColor: color || colors.primary,
          borderTopColor: 'transparent',
          borderRadius: spinnerSize / 2,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  skeletonCard: {
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  skeletonAvatar: {
    marginRight: Spacing.sm,
  },
  skeletonHeaderText: {
    flex: 1,
  },
  skeletonContent: {
    marginBottom: Spacing.md,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default LoadingScreen;
