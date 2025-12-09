import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { BorderRadius, Shadows } from '../../constants/theme';
import { getThemeColors, useTheme } from '../../hooks/use-theme';
import { Text } from './Text';

interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  fallbackText?: string;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'rounded' | 'square';
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  showBadge?: boolean;
  badgeColor?: string;
  badgeSize?: number;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onPress?: () => void;
  style?: ViewStyle;
  fallbackStyle?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  fallbackText,
  size = 'md',
  variant = 'circle',
  fallbackIcon = 'person',
  showBadge = false,
  badgeColor,
  badgeSize,
  badgePosition = 'bottom-right',
  onPress,
  style,
  fallbackStyle,
  disabled = false,
  loading = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const getSizeValue = (sizeInput: typeof size): number => {
    if (typeof sizeInput === 'number') return sizeInput;
    
    const sizes = {
      xs: 24,
      sm: 32,
      md: 48,
      lg: 64,
      xl: 80,
      '2xl': 96,
    };
    
    return sizes[sizeInput] || sizes.md;
  };
  
  const sizeValue = getSizeValue(size);
  const iconSize = Math.round(sizeValue * 0.5);
  const badgeDefaultSize = Math.round(sizeValue * 0.25);
  const finalBadgeSize = badgeSize || badgeDefaultSize;
  
  const getBorderRadius = () => {
    switch (variant) {
      case 'square':
        return BorderRadius.sm;
      case 'rounded':
        return BorderRadius.lg;
      case 'circle':
      default:
        return sizeValue / 2;
    }
  };
  
  const getBadgePosition = () => {
    const offset = finalBadgeSize / 2;
    
    switch (badgePosition) {
      case 'top-left':
        return { top: -offset, left: -offset };
      case 'top-right':
        return { top: -offset, right: -offset };
      case 'bottom-left':
        return { bottom: -offset, left: -offset };
      case 'bottom-right':
      default:
        return { bottom: -offset, right: -offset };
    }
  };
  
  const getInitials = (fullName: string): string => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 0) return '';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  const renderContent = () => {
    const showImage = source && !imageError && !loading;
    const showInitials = (name || fallbackText) && !showImage;
    const showIcon = !showImage && !showInitials;
    
    if (loading || imageLoading) {
      return (
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.skeleton,
            {
              backgroundColor: colors.muted,
              width: sizeValue,
              height: sizeValue,
              borderRadius: getBorderRadius(),
            },
          ]}
        />
      );
    }
    
    if (showImage) {
      return (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: getBorderRadius(),
            },
          ]}
          onError={() => setImageError(true)}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
      );
    }
    
    if (showInitials) {
      const displayText = fallbackText || (name ? getInitials(name) : '');
      return (
        <View
          style={[
            styles.fallback,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: getBorderRadius(),
              backgroundColor: colors.primary,
            },
            fallbackStyle,
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: sizeValue * 0.4,
                color: colors.primaryForeground,
              },
            ]}
          >
            {displayText}
          </Text>
        </View>
      );
    }
    
    return (
      <View
        style={[
          styles.fallback,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: getBorderRadius(),
            backgroundColor: colors.muted,
          },
          fallbackStyle,
        ]}
      >
        <Ionicons
          name={fallbackIcon}
          size={iconSize}
          color={colors.mutedForeground}
        />
      </View>
    );
  };
  
  const renderBadge = () => {
    if (!showBadge) return null;
    
    return (
      <View
        style={[
          styles.badge,
          {
            width: finalBadgeSize,
            height: finalBadgeSize,
            borderRadius: finalBadgeSize / 2,
            backgroundColor: badgeColor || colors.success,
            borderColor: colors.background,
          },
          getBadgePosition(),
        ]}
      />
    );
  };
  
  const avatarContent = (
    <View style={[styles.container, style]}>
      {renderContent()}
      {renderBadge()}
    </View>
  );
  
  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <MotiView
          animate={{
            scale: disabled ? 0.95 : 1,
            opacity: disabled ? 0.6 : 1,
          }}
          transition={{ type: 'timing', duration: 200 }}
        >
          {avatarContent}
        </MotiView>
      </TouchableOpacity>
    );
  }
  
  return avatarContent;
};

// Avatar Group Component
interface AvatarGroupProps {
  avatars: Array<{
    id: string;
    source?: { uri: string } | number;
    name?: string;
  }>;
  size?: AvatarProps['size'];
  max?: number;
  overlap?: number;
  onPress?: (id: string) => void;
  style?: ViewStyle;
  showMore?: boolean;
  moreText?: string;
  onMorePress?: () => void;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = 'md',
  max = 4,
  overlap = 8,
  onPress,
  style,
  showMore = true,
  moreText = '+{count}',
  onMorePress,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const sizeValue = typeof size === 'number' ? size : {
    xs: 24, sm: 32, md: 48, lg: 64, xl: 80, '2xl': 96
  }[size] || 48;
  
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);
  
  return (
    <View style={[styles.groupContainer, style]}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id}
          source={avatar.source}
          name={avatar.name}
          size={size}
          onPress={onPress ? () => onPress(avatar.id) : undefined}
          style={[
            styles.groupAvatar,
            {
              marginLeft: index > 0 ? -overlap : 0,
              zIndex: visibleAvatars.length - index,
              borderWidth: 2,
              borderColor: colors.background,
            },
          ] as any}
        />
      ))}
      
      {showMore && remainingCount > 0 && (
        <TouchableOpacity
          onPress={onMorePress}
          style={[
            styles.moreButton,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              backgroundColor: colors.muted,
              marginLeft: -overlap,
              zIndex: 0,
              borderWidth: 2,
              borderColor: colors.background,
            },
          ]}
        >
          <Text
            style={[
              styles.moreText,
              {
                fontSize: sizeValue * 0.3,
                color: colors.mutedForeground,
              },
            ]}
          >
            {moreText.replace('{count}', remainingCount.toString())}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  touchable: {
    // No additional styles needed
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '600',
    textAlign: 'center',
  },
  skeleton: {
    // Styles applied dynamically
  },
  badge: {
    position: 'absolute',
    borderWidth: 2,
    ...Shadows.small,
  },
  
  // Avatar Group Styles
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    ...Shadows.small,
  },
  moreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  moreText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Avatar;