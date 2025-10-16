/**
 * FILE: src/components/ui/index.ts
 * PURPOSE: Barrel export for UI components
 * RESPONSIBILITIES: Centralize UI component exports for easier imports
 */

export { default as LoadingSpinner } from './LoadingSpinner';
export { default as InputField } from './InputField';
export { default as Button } from './Button';

// Re-export types
export type { default as LoadingSpinnerProps } from './LoadingSpinner';
export type { default as InputFieldProps } from './InputField';
export type { default as ButtonProps } from './Button';