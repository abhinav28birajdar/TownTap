import React from 'react';
import {
    Text as RNText,
    TextProps as RNTextProps,
    StyleSheet,
    TextStyle,
} from 'react-native';
import { Typography } from '../../constants/theme';
import { getThemeColors, useTheme } from '../../hooks/use-theme';

// Text variant types
type TextVariant = 
  | 'display-large' | 'display-medium' | 'display-small'
  | 'headline-large' | 'headline-medium' | 'headline-small'
  | 'title-large' | 'title-medium' | 'title-small'
  | 'body-large' | 'body-medium' | 'body-small'
  | 'label-large' | 'label-medium' | 'label-small';

type TextColor = 
  | 'primary' | 'secondary' | 'accent'
  | 'success' | 'warning' | 'error'
  | 'text' | 'textSecondary' | 'textTertiary' | 'textDisabled'
  | 'foreground' | 'mutedForeground';

type TextAlign = 'left' | 'center' | 'right' | 'justify';

interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  color?: TextColor;
  align?: TextAlign;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  style?: TextStyle | TextStyle[];
}

const getVariantStyle = (variant: TextVariant): TextStyle => {
  const variantMap = {
    'display-large': Typography.styles.display.large,
    'display-medium': Typography.styles.display.medium,
    'display-small': Typography.styles.display.small,
    'headline-large': Typography.styles.headline.large,
    'headline-medium': Typography.styles.headline.medium,
    'headline-small': Typography.styles.headline.small,
    'title-large': Typography.styles.title.large,
    'title-medium': Typography.styles.title.medium,
    'title-small': Typography.styles.title.small,
    'body-large': Typography.styles.body.large,
    'body-medium': Typography.styles.body.medium,
    'body-small': Typography.styles.body.small,
    'label-large': Typography.styles.label.large,
    'label-medium': Typography.styles.label.medium,
    'label-small': Typography.styles.label.small,
  };
  
  return variantMap[variant] || Typography.styles.body.medium;
};

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body-medium',
  color = 'text',
  align = 'left',
  weight,
  italic = false,
  underline = false,
  strikethrough = false,
  style,
  ...props
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const variantStyle = getVariantStyle(variant);
  
  const textStyle: TextStyle = {
    ...variantStyle,
    color: colors[color as keyof typeof colors] || colors.text,
    textAlign: align,
    fontWeight: weight ? Typography.weights[weight] : variantStyle.fontWeight,
    fontStyle: italic ? 'italic' : 'normal',
    textDecorationLine: (
      underline && strikethrough ? 'underline line-through' :
      underline ? 'underline' :
      strikethrough ? 'line-through' :
      'none'
    ) as TextStyle['textDecorationLine'],
  };
  
  return (
    <RNText
      style={[textStyle, style]}
      {...props}
    >
      {children}
    </RNText>
  );
};

// Convenience components for common text styles
export const Heading1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="headline-large" {...props} />
);

export const Heading2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="headline-medium" {...props} />
);

export const Heading3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="headline-small" {...props} />
);

export const Title: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="title-large" {...props} />
);

export const Subtitle: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="title-medium" {...props} />
);

export const Body: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body-medium" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body-small" color="textSecondary" {...props} />
);

export const Label: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="label-medium" {...props} />
);

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default Text;