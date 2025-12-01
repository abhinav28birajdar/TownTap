import { MotiView } from 'moti';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { Spacing } from '../../constants/spacing';
import { BorderRadius, Shadows } from '../../constants/theme';
import { getThemeColors, useTheme } from '../../hooks/use-theme';
import { Text } from './Text';

type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardVariant;
  size?: CardSize;
  pressable?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  pressable = false,
  style,
  children,
  onPress,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    };
    
    // Size padding
    switch (size) {
      case 'sm':
        baseStyle.padding = Spacing.sm;
        break;
      case 'lg':
        baseStyle.padding = Spacing.lg;
        break;
      default:
        baseStyle.padding = Spacing.md;
    }
    
    // Variant styling
    switch (variant) {
      case 'outlined':
        baseStyle.backgroundColor = colors.background;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border;
        break;
      case 'elevated':
        baseStyle.backgroundColor = colors.card;
        baseStyle.borderWidth = 0;
        Object.assign(baseStyle, Shadows.md);
        break;
      case 'filled':
        baseStyle.backgroundColor = colors.surfaceSecondary;
        baseStyle.borderWidth = 0;
        break;
      default:
        baseStyle.backgroundColor = colors.card;
        baseStyle.borderWidth = 0;
        Object.assign(baseStyle, Shadows.sm);
    }
    
    return baseStyle;
  };
  
  const cardStyle = getCardStyle();
  
  if (pressable || onPress) {
    return (
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'timing',
          duration: 150,
        }}
      >
        <TouchableOpacity
          style={[cardStyle, style]}
          onPress={onPress}
          activeOpacity={0.95}
        >
          {children}
        </TouchableOpacity>
      </MotiView>
    );
  }
  
  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};

// Card Header Component
interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  avatar,
  action,
  style,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  return (
    <View style={[styles.header, style]}>
      {avatar && (
        <View style={styles.avatar}>
          {avatar}
        </View>
      )}
      
      <View style={styles.headerContent}>
        {title && (
          <Text
            variant="title-medium"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            variant="body-small"
            style={{ color: colors.textSecondary }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {action && (
        <View style={styles.action}>
          {action}
        </View>
      )}
    </View>
  );
};

// Card Content Component
interface CardContentProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  style,
  children,
}) => {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
};

// Card Footer Component
interface CardFooterProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  style,
  children,
}) => {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
};

// Card Actions Component
interface CardActionsProps {
  align?: 'left' | 'right' | 'center' | 'space-between';
  style?: ViewStyle;
  children: React.ReactNode;
}

export const CardActions: React.FC<CardActionsProps> = ({
  align = 'right',
  style,
  children,
}) => {
  const justifyContent = 
    align === 'left' ? 'flex-start' :
    align === 'center' ? 'center' :
    align === 'space-between' ? 'space-between' :
    'flex-end';
    
  return (
    <View style={[
      styles.actions,
      { justifyContent },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    marginRight: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  action: {
    marginLeft: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});

export default Card;