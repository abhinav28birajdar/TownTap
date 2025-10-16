/**
 * FILE: src/styles/shared.ts
 * PURPOSE: Shared styles and style utilities to reduce duplication
 * RESPONSIBILITIES: Provide consistent styling patterns across the app
 */

import { StyleSheet } from 'react-native';

// Common colors
export const colors = {
  primary: '#007AFF',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#FF3B30',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff',
  black: '#000000',
  gray: {
    100: '#f8f9fa',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#6c757d',
    600: '#495057',
    700: '#343a40',
    800: '#212529',
    900: '#000000',
  },
  background: '#f5f5f5',
  surface: '#ffffff',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    white: '#ffffff',
  },
  border: {
    light: '#e9ecef',
    medium: '#dee2e6',
    dark: '#ced4da',
  },
};

// Common spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Common border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

// Shadow presets
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Typography presets
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

// Common styles
export const commonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  screenPadding: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  
  // Flexbox utilities
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexBetween: {
    justifyContent: 'space-between',
  },
  flexAround: {
    justifyContent: 'space-around',
  },
  flexEvenly: {
    justifyContent: 'space-evenly',
  },
  
  // Common components
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  // Form elements
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.danger,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  
  // Buttons
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.text.white,
  },
  buttonTextOutline: {
    ...typography.button,
    color: colors.primary,
  },
  
  // Lists
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.text.secondary,
  },
  
  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Separators
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  
  // Text utilities
  textCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
  },
  textPrimary: {
    color: colors.text.primary,
  },
  textSecondary: {
    color: colors.text.secondary,
  },
  textLight: {
    color: colors.text.light,
  },
});

// Utility functions
export const getSpacing = (multiplier: number) => spacing.md * multiplier;

export const getTypographyStyle = (variant: keyof typeof typography) => {
  return typography[variant];
};

export const getShadowStyle = (level: keyof typeof shadows) => {
  return shadows[level];
};