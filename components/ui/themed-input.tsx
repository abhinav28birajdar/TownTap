import { BorderRadius } from '@/constants/theme';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useState } from 'react';
import {
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    TextInput,
    TextInputFocusEventData,
    TextInputProps,
    View,
} from 'react-native';
import { ThemedText } from './themed-text-enhanced';

interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  fullWidth?: boolean;
  containerStyle?: any;
}

export const ThemedInput = memo(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  fullWidth = true,
  containerStyle,
  style,
  onFocus,
  onBlur,
  secureTextEntry,
  ...props
}: ThemedInputProps) => {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const showPasswordToggle = secureTextEntry !== undefined;
  const actualRightIcon = showPasswordToggle
    ? (isPasswordVisible ? 'eye-off-outline' : 'eye-outline')
    : rightIcon;
  
  const actualOnRightIconPress = showPasswordToggle
    ? () => setIsPasswordVisible(!isPasswordVisible)
    : onRightIconPress;

  return (
    <View style={[fullWidth && styles.fullWidth, containerStyle]}>
      {label && (
        <ThemedText
          variant="labelMedium"
          color="secondary"
          style={styles.label}
        >
          {label}
        </ThemedText>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: getBorderColor(),
          },
          isFocused && styles.focused,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        
        {actualRightIcon && (
          <Pressable
            onPress={actualOnRightIconPress}
            style={styles.rightIconContainer}
            hitSlop={8}
          >
            <Ionicons
              name={actualRightIcon}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      
      {(error || helperText) && (
        <ThemedText
          variant="labelSmall"
          color={error ? 'error' : 'secondary'}
          style={styles.helperText}
        >
          {error || helperText}
        </ThemedText>
      )}
    </View>
  );
});

ThemedInput.displayName = 'ThemedInput';

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  focused: {
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
    padding: 4,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 4,
  },
});
