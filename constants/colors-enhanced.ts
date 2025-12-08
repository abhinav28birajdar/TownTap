/**
 * Enhanced Color System
 * Comprehensive light and dark mode color palette
 */

export const ColorsEnhanced = {
  light: {
    // Primary colors
    primary: '#2563eb', // blue-600
    primaryLight: '#3b82f6', // blue-500
    primaryDark: '#1e40af', // blue-700
    primaryFaded: '#dbeafe', // blue-50
    
    // Secondary colors
    secondary: '#7c3aed', // violet-600
    secondaryLight: '#8b5cf6', // violet-500
    secondaryDark: '#6d28d9', // violet-700
    secondaryFaded: '#ede9fe', // violet-50
    
    // Accent
    accent: '#f59e0b', // amber-500
    accentLight: '#fbbf24', // amber-400
    accentDark: '#d97706', // amber-600
    
    // Neutrals
    background: '#ffffff',
    backgroundSecondary: '#f9fafb', // gray-50
    backgroundTertiary: '#f3f4f6', // gray-100
    
    surface: '#ffffff',
    surfaceSecondary: '#f9fafb',
    
    // Text
    text: '#111827', // gray-900
    textSecondary: '#6b7280', // gray-500
    textTertiary: '#9ca3af', // gray-400
    textInverse: '#ffffff',
    
    // Borders
    border: '#e5e7eb', // gray-200
    borderLight: '#f3f4f6', // gray-100
    borderDark: '#d1d5db', // gray-300
    
    // Status colors
    success: '#10b981', // green-500
    successLight: '#34d399', // green-400
    successDark: '#059669', // green-600
    successBg: '#d1fae5', // green-100
    
    warning: '#f59e0b', // amber-500
    warningLight: '#fbbf24', // amber-400
    warningDark: '#d97706', // amber-600
    warningBg: '#fef3c7', // amber-100
    
    error: '#ef4444', // red-500
    errorLight: '#f87171', // red-400
    errorDark: '#dc2626', // red-600
    errorBg: '#fee2e2', // red-100
    
    info: '#3b82f6', // blue-500
    infoLight: '#60a5fa', // blue-400
    infoDark: '#2563eb', // blue-600
    infoBg: '#dbeafe', // blue-100
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
    
    // Card & Shadows
    card: '#ffffff',
    cardBorder: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Interactive
    link: '#2563eb',
    linkHover: '#1e40af',
    linkVisited: '#7c3aed',
    
    // Special
    badge: '#ef4444',
    badgeText: '#ffffff',
    
    // Ratings
    rating: '#f59e0b',
    ratingEmpty: '#d1d5db',
  },
  
  dark: {
    // Primary colors
    primary: '#3b82f6', // blue-500
    primaryLight: '#60a5fa', // blue-400
    primaryDark: '#2563eb', // blue-600
    primaryFaded: '#1e3a8a', // blue-900
    
    // Secondary colors
    secondary: '#8b5cf6', // violet-500
    secondaryLight: '#a78bfa', // violet-400
    secondaryDark: '#7c3aed', // violet-600
    secondaryFaded: '#4c1d95', // violet-900
    
    // Accent
    accent: '#fbbf24', // amber-400
    accentLight: '#fcd34d', // amber-300
    accentDark: '#f59e0b', // amber-500
    
    // Neutrals
    background: '#0f172a', // slate-900
    backgroundSecondary: '#1e293b', // slate-800
    backgroundTertiary: '#334155', // slate-700
    
    surface: '#1e293b', // slate-800
    surfaceSecondary: '#334155', // slate-700
    
    // Text
    text: '#f1f5f9', // slate-100
    textSecondary: '#94a3b8', // slate-400
    textTertiary: '#64748b', // slate-500
    textInverse: '#0f172a',
    
    // Borders
    border: '#334155', // slate-700
    borderLight: '#475569', // slate-600
    borderDark: '#1e293b', // slate-800
    
    // Status colors
    success: '#10b981', // green-500
    successLight: '#34d399', // green-400
    successDark: '#059669', // green-600
    successBg: '#064e3b', // green-900
    
    warning: '#f59e0b', // amber-500
    warningLight: '#fbbf24', // amber-400
    warningDark: '#d97706', // amber-600
    warningBg: '#78350f', // amber-900
    
    error: '#ef4444', // red-500
    errorLight: '#f87171', // red-400
    errorDark: '#dc2626', // red-600
    errorBg: '#7f1d1d', // red-900
    
    info: '#3b82f6', // blue-500
    infoLight: '#60a5fa', // blue-400
    infoDark: '#2563eb', // blue-600
    infoBg: '#1e3a8a', // blue-900
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
    overlayDark: 'rgba(0, 0, 0, 0.85)',
    
    // Card & Shadows
    card: '#1e293b', // slate-800
    cardBorder: '#334155', // slate-700
    shadow: 'rgba(0, 0, 0, 0.4)',
    
    // Interactive
    link: '#60a5fa', // blue-400
    linkHover: '#93c5fd', // blue-300
    linkVisited: '#a78bfa', // violet-400
    
    // Special
    badge: '#ef4444',
    badgeText: '#ffffff',
    
    // Ratings
    rating: '#fbbf24', // amber-400
    ratingEmpty: '#475569', // slate-600
  },
};

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof ColorsEnhanced.light;
