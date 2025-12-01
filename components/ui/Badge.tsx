import { MotiView } from 'moti';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { Spacing } from '../../constants/spacing';
import { BorderRadius } from '../../constants/theme';
import { getThemeColors, useTheme } from '../../hooks/use-theme';
import { Text } from './Text';

interface BadgeProps {
  children?: React.ReactNode;
  text?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: ViewStyle;
  dot?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  offset?: { x: number; y: number };
  animated?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  text,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  onPress,
  style,
  textStyle,
  dot = false,
  position,
  offset = { x: 0, y: 0 },
  animated = false,
  pulse = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          color: colors.primaryForeground,
          borderColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
          color: colors.secondaryForeground,
          borderColor: colors.secondary,
        };
      case 'success':
        return {
          backgroundColor: colors.success,
          color: colors.successForeground,
          borderColor: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          color: colors.warningForeground,
          borderColor: colors.warning,
        };
      case 'error':
        return {
          backgroundColor: colors.destructive,
          color: colors.destructiveForeground,
          borderColor: colors.destructive,
        };
      case 'info':
        return {
          backgroundColor: colors.info,
          color: colors.infoForeground,
          borderColor: colors.info,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.text,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.muted,
          color: colors.mutedForeground,
          borderColor: colors.muted,
        };
    }
  };
  
  const getSizeStyles = () => {
    if (dot) {
      const sizes = {
        xs: { width: 6, height: 6 },
        sm: { width: 8, height: 8 },
        md: { width: 10, height: 10 },
        lg: { width: 12, height: 12 },
      };
      return sizes[size];
    }
    
    const sizes = {
      xs: {
        paddingHorizontal: 4,
        paddingVertical: 1,
        fontSize: 10,
        minWidth: 16,
        minHeight: 16,
      },
      sm: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 11,
        minWidth: 18,
        minHeight: 18,
      },
      md: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        fontSize: 12,
        minWidth: 20,
        minHeight: 20,
      },
      lg: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        fontSize: 14,
        minWidth: 24,
        minHeight: 24,
      },
    };
    
    return sizes[size];
  };
  
  const getShapeStyles = () => {
    const sizeStyles = getSizeStyles();
    
    switch (shape) {
      case 'pill':
        return {
          borderRadius: Math.max(sizeStyles.minHeight || 20, sizeStyles.minWidth || 20) / 2,
        };
      case 'square':
        return {
          borderRadius: BorderRadius.xs,
        };
      case 'rounded':
      default:
        return {
          borderRadius: BorderRadius.sm,
        };
    }
  };
  
  const getPositionStyles = () => {
    if (!position) return {};
    
    const basePosition = {
      position: 'absolute' as const,
      zIndex: 10,
    };
    
    switch (position) {
      case 'top-left':
        return {
          ...basePosition,
          top: offset.y,
          left: offset.x,
        };
      case 'top-right':
        return {
          ...basePosition,
          top: offset.y,
          right: offset.x,
        };
      case 'bottom-left':
        return {
          ...basePosition,
          bottom: offset.y,
          left: offset.x,
        };
      case 'bottom-right':
        return {
          ...basePosition,
          bottom: offset.y,
          right: offset.x,
        };
      default:
        return basePosition;
    }
  };
  
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const shapeStyles = getShapeStyles();
  const positionStyles = getPositionStyles();
  
  const badgeContent = (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth || 0,
        },
        sizeStyles,
        shapeStyles,
        positionStyles,
        style,
      ]}
    >
      {!dot && (text || children) && (
        <Text
          style={[
            styles.text,
            {
              color: variantStyles.color,
              fontSize: sizeStyles.fontSize,
              lineHeight: sizeStyles.fontSize * 1.2,
            },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {text || children}
        </Text>
      )}
    </View>
  );
  
  if (pulse) {
    return (
      <MotiView
        from={{ scale: 1, opacity: 1 }}
        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
        transition={{
          type: 'timing',
          duration: 1500,
          loop: true,
        }}
      >
        {badgeContent}
      </MotiView>
    );
  }
  
  if (animated) {
    return (
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 200,
        }}
      >
        {badgeContent}
      </MotiView>
    );
  }
  
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {badgeContent}
      </TouchableOpacity>
    );
  }
  
  return badgeContent;
};

// Notification Badge Component
export const NotificationBadge: React.FC<{
  count: number;
  maxCount?: number;
  showZero?: boolean;
  position?: BadgeProps['position'];
  offset?: BadgeProps['offset'];
  size?: BadgeProps['size'];
  onPress?: () => void;
}> = ({
  count,
  maxCount = 99,
  showZero = false,
  position = 'top-right',
  offset = { x: -6, y: -6 },
  size = 'sm',
  onPress,
}) => {
  if (count === 0 && !showZero) return null;
  
  const displayText = count > maxCount ? `${maxCount}+` : count.toString();
  
  return (
    <Badge
      text={displayText}
      variant="error"
      size={size}
      shape="pill"
      position={position}
      offset={offset}
      onPress={onPress}
      animated
    />
  );
};

// Status Badge Component
export const StatusBadge: React.FC<{
  status: 'online' | 'offline' | 'away' | 'busy';
  position?: BadgeProps['position'];
  offset?: BadgeProps['offset'];
  size?: BadgeProps['size'];
}> = ({
  status,
  position = 'bottom-right',
  offset = { x: -2, y: -2 },
  size = 'sm',
}) => {
  const getStatusVariant = () => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'default';
      case 'away':
        return 'warning';
      case 'busy':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Badge
      variant={getStatusVariant()}
      size={size}
      shape="pill"
      position={position}
      offset={offset}
      dot
    />
  );
};

// Badge Group Component
export const BadgeGroup: React.FC<{
  badges: Array<{
    id: string;
    text: string;
    variant?: BadgeProps['variant'];
    onPress?: () => void;
  }>;
  size?: BadgeProps['size'];
  shape?: BadgeProps['shape'];
  style?: ViewStyle;
  spacing?: number;
}> = ({
  badges,
  size = 'md',
  shape = 'rounded',
  style,
  spacing = Spacing.xs,
}) => {
  return (
    <View style={[styles.badgeGroup, style]}>
      {badges.map((badge, index) => (
        <Badge
          key={badge.id}
          text={badge.text}
          variant={badge.variant}
          size={size}
          shape={shape}
          onPress={badge.onPress}
          style={[
            index > 0 && { marginLeft: spacing },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  touchable: {
    // No additional styles needed
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});

export default Badge;